# MMM-PulseCamera
これはusbのwebカメラで画像データから脈拍を推測する [MagicMirror](https://github.com/MichMich/MagicMirror)のためのモジュールです。

## Installation
1. Navigate into your MagicMirror's `modules` folder
2. Execute `git clone https://github.com/itto-software/MMM-PulseCamera.git`
3. No `npm install` is needed
4. (Re)start magic mirror (e.g. with `pm2 restart mm`)

# Using the module
To use this module, add it to the modules array in the `config/config.js` file:

```javascript
modules: [
    {
        module: 'MMM-PulseCamera',
        position: 'lower_third'
    }
]
```
