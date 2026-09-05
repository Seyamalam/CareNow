"""Repeat six pickup-sheet open/close cycles on the inspected 1080x2400 test AVD.

Usage: python3 scripts/profile-picker.py emulator-5580 docs/performance/result.txt
Open Transport, leave its booking panel collapsed, and verify the pickup/close
coordinates with the accessibility inspector before running on another device.
No app data or other emulator is touched.
"""
import subprocess
import sys
import time
from pathlib import Path

serial, destination = sys.argv[1:]
def adb(*args):
    return subprocess.check_output(['adb', '-s', serial, *args])
adb('shell', 'dumpsys', 'gfxinfo', 'com.carenow.demo', 'reset')
for _ in range(6):
    adb('shell', 'input', 'tap', '495', '1305')
    time.sleep(.55)
    adb('shell', 'input', 'tap', '994', '913')
    time.sleep(.55)
Path(destination).write_bytes(adb('shell', 'dumpsys', 'gfxinfo', 'com.carenow.demo', 'framestats'))
