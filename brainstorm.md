here are the commands that i will be using

for organizing a directory (i will confirm using inquirer before actually performing the action)
clutter-cutter organize . | clutter-cutter organize --dir "./images/2023 memories"
options:
--dry-run or -D for viewing how the result would be without actually organizing the directory
-b or --by-date for organizing files into year/month or date folders

for undoing
clutter-cutter --undo | clutter-cutter -u

basic organizing is working now. I've created `organizer` method to organize the files in their respective categories. The next goal is to make this method safer by asking confirmation from users before performing the action.