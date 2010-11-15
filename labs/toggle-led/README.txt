The SYSFS entries for the BeagleBoard LEDs are mounted
at "/sys/class/leds".  You'll find "beagleboard::usr0"
and "beagleboard::usr1".  Each of those directories will
have "trigger" and "brightness" entries.

For this lab exercise, attempt to stop USR0 from blinking
and then turn it on steady, then off, then back to the
blinking state.

You'll need two common Unix/Linux tools called "echo"
and "cat".  "echo" allows you to create output to be
sent to the SYSFS entries and "cat" allows you to read
them.  Not all SYSFS entries can be read or written.

1) Start by using "cat" to print out the current state of
"trigger".

2) Change the state of the "trigger" to "none" using "echo".
The syntax of "echo" is roughly:

echo "text to write" > file_to_be_written

3) Change the state of the "brightness" to "1" using "echo".
Observe the USR0 LED.

4) Change the state of the "brightness" to "0" using "echo".
Observe the USR0 LED.

5) Restore the state of the "trigger" to "heartbeat" using
echo.  Use "cat" to see that the state is restored and
observe the USR0 LED.

This lab was used to provide training for the University
of Texas BeagleBoard Open Source Design Challenge
(http://beagleboard.org/challenge)
