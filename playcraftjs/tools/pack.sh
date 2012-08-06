#!/bin/bash
PLAYCRAFT_LIB=../lib

OUT_FILE=playcraft.js
OUT_MIN_FILE=playcraft.min.js

# empty it out
> ${OUT_FILE}

# append all the files into one -- layer we could use a parser to look for requires declarations?

cat $PLAYCRAFT_LIB/ext/jquery171.js >> ${OUT_FILE}
cat $PLAYCRAFT_LIB/ext/gamecore.js/src/class.js >> ${OUT_FILE}
cat $PLAYCRAFT_LIB/ext/gamecore.js/src/gamecore.js >> ${OUT_FILE}
cat $PLAYCRAFT_LIB/ext/gamecore.js/src/jhashtable.js >> ${OUT_FILE}
cat $PLAYCRAFT_LIB/ext/gamecore.js/src/device.js >> ${OUT_FILE}
cat $PLAYCRAFT_LIB/ext/gamecore.js/src/perf.js >> ${OUT_FILE}
cat $PLAYCRAFT_LIB/ext/gamecore.js/src/linkedlist.js >> ${OUT_FILE}
cat $PLAYCRAFT_LIB/ext/gamecore.js/src/pooled.js >> ${OUT_FILE}
cat $PLAYCRAFT_LIB/ext/base64.js >> ${OUT_FILE}
cat $PLAYCRAFT_LIB/ext/stacktrace.js >> ${OUT_FILE}
cat $PLAYCRAFT_LIB/playcraft.js >> ${OUT_FILE}
cat $PLAYCRAFT_LIB/input.js >> ${OUT_FILE}
cat $PLAYCRAFT_LIB/tools.js >> ${OUT_FILE}
cat $PLAYCRAFT_LIB/element.js >> ${OUT_FILE}
cat $PLAYCRAFT_LIB/debug.js >> ${OUT_FILE}
cat $PLAYCRAFT_LIB/system.js >> ${OUT_FILE}
cat $PLAYCRAFT_LIB/layer.js >> ${OUT_FILE}
cat $PLAYCRAFT_LIB/entity.js >> ${OUT_FILE}
cat $PLAYCRAFT_LIB/particle.js >> ${OUT_FILE}
cat $PLAYCRAFT_LIB/collision.js >> ${OUT_FILE}
cat $PLAYCRAFT_LIB/spritesheet.js >> ${OUT_FILE}
cat $PLAYCRAFT_LIB/sprite.js >> ${OUT_FILE}
cat $PLAYCRAFT_LIB/math.js >> ${OUT_FILE}
cat $PLAYCRAFT_LIB/image.js >> ${OUT_FILE}
cat $PLAYCRAFT_LIB/sound.js >> ${OUT_FILE}
cat $PLAYCRAFT_LIB/scene.js >> ${OUT_FILE}
cat $PLAYCRAFT_LIB/game.js >> ${OUT_FILE}
cat $PLAYCRAFT_LIB/isotools.js >> ${OUT_FILE}
cat $PLAYCRAFT_LIB/ui.js >> ${OUT_FILE}
cat $PLAYCRAFT_LIB/loader.js >> ${OUT_FILE}
cat $PLAYCRAFT_LIB/dataresource.js >> ${OUT_FILE}

> ${OUT_MIN_FILE}
java -jar yuicompressor-2.4.7.jar ${OUT_FILE} -v -o ${OUT_MIN_FILE}
