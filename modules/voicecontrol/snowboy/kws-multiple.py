import snowboydecoder
import sys
import signal

# Demo code for listening two hotwords at the same time

interrupted = False


def signal_handler(signal, frame):
    global interrupted
    interrupted = True


def interrupt_callback():
    global interrupted
    return interrupted

# if len(sys.argv) != 3:
#     print("Error: need to specify 2 model names")
#     print("Usage: python demo.py 1st.model 2nd.model")
#     sys.exit(-1)

models = sys.argv[1:]

def hotword_detected_callback():
    print("!Hotword Detected")
    snowboydecoder.play_audio_file(snowboydecoder.DETECT_DING)

    
# capture SIGINT signal, e.g., Ctrl+C
signal.signal(signal.SIGINT, signal_handler)

sensitivity = [0.5]*len(models)
detector = snowboydecoder.HotwordDetector(models, sensitivity=sensitivity)
# callbacks = [print("DETECTED:1"),
#               print("DETECTED:2")]
print('Listening... Press Ctrl+C to exit')

# main loop
# make sure you have the same numbers of callbacks and models
detector.start(detected_callback=hotword_detected_callback,
               interrupt_check=interrupt_callback,
               sleep_time=0.03)

detector.terminate()
