(function (window) {

    "use strict";

    var numeric = require("./numeric-1.2.6.js");
    var HREsitimator = function (nSignalSource = 1, nHistoryMax = 100, basePlusWidth = 300, minimumPeakInterval = 250, fitWindowWidth = undefined) {

        // シグナル源の数
        this.nSignalSource = nSignalSource
        // データの最大保管数
        this.nHistoryMax = nHistoryMax
        // 想定するパルスの時間幅[ms]
        this.basePlusWidth = basePlusWidth
        // ピーク検出時に用いるデータの範囲[ms](最新のデータからどの時刻までを含めるか)
        // 大きすぎると、単一ピークにフィットできない
        this.fitWindowWidth = (fitWindowWidth === undefined ? basePlusWidth * 2 : fitWindowWidth)
        // 別のピークと判断する時間の閾値[ms]
        this.minimumPeakInterval = minimumPeakInterval

        // シグナル源ごとに、入力そのまま、フィルタ結果、白のタイミングを保存
        this.hSignal = Array.from({ length: nSignalSource }).map(x => [])
        this.hFilteredSignal = Array.from({ length: nSignalSource }).map(x => [])
        this.hBeatTiming = Array.from({ length: nSignalSource }).map(x => [])
        // 配列の先頭に要素を追加、lを超えたら後ろから捨てていく関数
        this.pushWithLimit = function (h, l, x) {
            if (h.length >= l) h.pop()
            h.unshift(x)
        }

        // シグナル源ごとの最新のピーク、脈拍
        this.lastPeak = Array.from({ length: nSignalSource }).map(x => undefined)
        this.heartRate = Array.from({ length: nSignalSource }).map(x => undefined)

        //////////////////////////////////////////////////
        // 相関フィルタ
        // 相関を取る関数は単純な矩形波の方が良いかもしれない
        // 時間間隔で取るシグナル数が変わるのは良くない
        //////////////////////////////////////////////////
        // 最小時間幅
        this.baseTimeWidth = basePlusWidth / 3.0
        // 区間とフィルタの直線の係数
        // ex. (0*baseTimeWidth, 1*baseTimeWidth)のフィルタ関数は-1.0x+0.0
        // 定義がないところは0
        this.filter = [
            [1, -1.0, +0.0],
            [2, +0.0, -1.0],
            [3, +1.0, -3.0],
            [4, +2.0, -6.0],
            [5, +0.0, +2.0],
            [6, -2.0, +12.0],
            [7, -1.0, +6.0],
            [8, +0.0, -1.0],
            [9, +1.0, -9.0],
        ]
        this.filterCount = this.filter.length

        // 単一源の入力そのままの配列を受けて、最新のフィルタ結果を計算 
        // h: hSignalのどれか
        this.apllyFilter = function (h) {
            var baseTime = h[0][0]
            var fpointer = 0
            var ft = this.filter[fpointer][0], fa = this.filter[fpointer][1], fb = this.filter[fpointer][2]
            var v = 0.0
            var i
            for (i = 0; i < h.length; i++) {
                var t = (baseTime - h[i][0]) / this.baseTimeWidth
                if (t >= ft) {
                    fpointer += 1
                    if (fpointer >= this.filterCount) break
                    ft = this.filter[fpointer][0]
                    fa = this.filter[fpointer][1]
                    fb = this.filter[fpointer][2]
                }
                v += (fa * t + fb) * h[i][1]
            }
            return [baseTime, v / (0.5 * i)]
        }

        //////////////////////////////////////////////////
        // 各信号源のシグナルデータ入力
        //////////////////////////////////////////////////
        // t: 取得時間
        // s: [信号源0のシグナル, 信号源1のシグナル, ,,,]
        this.pushSignal = function (t, s) {
            for (var signalSourceId = 0; signalSourceId < nSignalSource; signalSourceId += 1) {
                // 入力を履歴に追加
                this.pushWithLimit(this.hSignal[signalSourceId], this.nHistoryMax, [t, s[signalSourceId]])
                // フィルタ計算して履歴に追加
                var x = this.apllyFilter(this.hSignal[signalSourceId])
                this.pushWithLimit(this.hFilteredSignal[signalSourceId], this.nHistoryMax, x)

                // ピークフィット
                var peak = this.fit(model.hFilteredSignal[signalSourceId], 2 * basePlusWidth)
                if (peak[0]) {
                    // ピークが検出できた時
                    if (this.lastPeak[signalSourceId] !== undefined) {
                        // 前回検出したピークに比べてthis.minimumPeakIntervalより後の時刻ならば、新しいピークとみなす。
                        var dt = peak[1] - this.lastPeak[signalSourceId][1]
                        if (dt > this.minimumPeakInterval) {
                            // ピークの情報を履歴に保存
                            var beatInfo = { time: peak[1], heartRate: 60000.0 / dt, dt: dt, height: peak[2] }
                            this.pushWithLimit(this.hBeatTiming[signalSourceId], this.nHistoryMax, beatInfo)
                            this.lastPeak[signalSourceId] = peak
                            this.heartRate[signalSourceId] = beatInfo.heartRate
                        }
                    }
                    else {
                        this.lastPeak[signalSourceId] = peak
                    }
                }
            }
        }

        //////////////////////////////////////////////////
        // フィルタ結果のデータ系列に二次曲線を当てはめ
        //////////////////////////////////////////////////
        // 二乗誤差関数をパラメータで偏微分し、極値を求める。
        // y = a2*t*t + a1*t + a0
        // h: hFilteredSignalのどれか
        // s: データ窓[ms]
        this.fit = function (h, w) {
            // 履歴から行列を計算
            var T = [0.0, 0.0, 0.0, 0.0, 0.0]
            var Y = [0.0, 0.0, 0.0]
            var baseTime = h[0][0]
            for (var i = 0; i < h.length; i++) {
                var tInMS = baseTime - h[i][0]
                if (tInMS > w) break
                var t = tInMS / 1000.0
                var t2 = t * t
                Y[0] += h[i][1]
                Y[1] += h[i][1] * t
                Y[2] += h[i][1] * t2
                T[0] += 1
                T[1] += t
                T[2] += t2
                T[3] += t * t2
                T[4] += t2 * t2
            }

            var n = T[0]
            if (n == 0) return undefined

            // 連立方程式を解く x = [a2, a1, a0]
            var x = numeric.solve([[T[4], T[3], T[2]], [T[3], T[2], T[1]], [T[2], T[1], T[0]]], [Y[2], Y[1], Y[0]])
            var detected = false, peakTime, peakHeight
            // 上に凸でピークが窓内にあり、0より大きい頂点を持つ時ピークを検出したとみなす。
            if (x[0] < 0) {
                peakTime = 1000 * (-0.5 * x[1] / x[0])
                peakHeight = x[2] - 0.25 * x[1] * x[1] / (x[0])
                if (peakTime > 0 && peakTime < w && peakHeight > 0) detected = true
            }
            return [detected, baseTime - peakTime, peakHeight]
        }
    }
});