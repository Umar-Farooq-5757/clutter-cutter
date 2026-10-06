here are the commands that i will be using

for organizing a directory (i will confirm using inquirer before actually performing the action)
clutter-cutter organize . | clutter-cutter organize --dir "./images/2023 memories"
options:
--dry-run or -D for viewing how the result would be without actually organizing the directory
-b or --by-date for organizing files into year/month or date folders

for undoing
clutter-cutter --undo | clutter-cutter -u

Undo command is working now. You can run `clutter-cutter undo <folder-name>` to undo the organization of files and put them back to their original place.