#!/bin/zsh
cd "/Users/thebayniac/Documents/(A) Documents/(A) WBM Enterprises/(B) Notable/(B) Clients/Charles Nalle/cnwm-v2"
LOG=docs/v7/qa/juror-pass9/run-all.log
: > $LOG
run() { echo "=== $* $(date +%T)" >> $LOG; node "$@" >> $LOG 2>&1; echo "--- exit $? $(date +%T)" >> $LOG; }
run scripts/juror9-home-chapter.mjs p360
run scripts/juror9-map.mjs p360
run scripts/juror9-museum.mjs p360
run scripts/juror9-home-chapter.mjs t768
run scripts/juror9-map.mjs t768
run scripts/juror9-museum.mjs t768
run scripts/juror9-pages.mjs t768
run scripts/juror9-home-chapter.mjs t1024
run scripts/juror9-map.mjs t1024
run scripts/juror9-museum.mjs t1024
run scripts/juror9-home-chapter.mjs d1440
run scripts/juror9-map.mjs d1440
run scripts/juror9-pages.mjs d1440
run scripts/juror9-home-chapter.mjs d1920
run scripts/juror9-map.mjs d1920
run scripts/juror9-museum.mjs d1920
run scripts/juror9-museum.mjs z720
run scripts/juror9-pages.mjs z720
echo "ALL DONE $(date +%T)" >> $LOG
