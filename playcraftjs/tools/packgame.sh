#!/bin/bash
PLAYCRAFT_LIB=../lib
OUT_FILE=starfrontier.js

# empty it out
> ${OUT_FILE}

# append all the files into one -- later we could use a parser to look for requires declarations?

cat ../../demos/starfrontier/js/game.js >> $OUT_FILE
cat ../../demos/starfrontier/js/ui.js >> $OUT_FILE
cat ../../demos/starfrontier/js/menu.js >> $OUT_FILE
cat ../../demos/starfrontier/js/radar.js >> $OUT_FILE
cat ../../demos/starfrontier/js/gamescene.js >> $OUT_FILE
cat ../../demos/starfrontier/js/background.js >> $OUT_FILE

java -jar yuicompressor-2.4.7.jar starfrontier.js -v -o starfrontier.min.js

