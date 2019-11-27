@echo off
rmdir /q /s out
mkdir out
7z a -tzip -r out/Sliwipi.xpi * -x!.* -x!out
