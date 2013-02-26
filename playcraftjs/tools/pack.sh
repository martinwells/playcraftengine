#!/bin/bash
PLAYCRAFT_LIB=../lib

OUT_FILE=playcraft-cat.js
OUT_MIN_FILE=../dist/playcraft-0.5.6.min.js

# empty it out
> ${OUT_FILE}

cat $PLAYCRAFT_LIB/packed.js >> ${OUT_FILE}

cat $PLAYCRAFT_LIB/ext/gamecore.js/src/gamecore.js >> ${OUT_FILE}
cat $PLAYCRAFT_LIB/ext/gamecore.js/src/class.js >> ${OUT_FILE}
cat $PLAYCRAFT_LIB/ext/gamecore.js/src/base.js >> ${OUT_FILE}
cat $PLAYCRAFT_LIB/ext/gamecore.js/src/jhashtable.js >> ${OUT_FILE}
cat $PLAYCRAFT_LIB/ext/gamecore.js/src/device.js >> ${OUT_FILE}
cat $PLAYCRAFT_LIB/ext/gamecore.js/src/perf.js >> ${OUT_FILE}
cat $PLAYCRAFT_LIB/ext/gamecore.js/src/linkedlist.js >> ${OUT_FILE}
cat $PLAYCRAFT_LIB/ext/gamecore.js/src/hashlist.js >> ${OUT_FILE}
cat $PLAYCRAFT_LIB/ext/gamecore.js/src/stacktrace.js >> ${OUT_FILE}
cat $PLAYCRAFT_LIB/ext/gamecore.js/src/pooled.js >> ${OUT_FILE}
cat $PLAYCRAFT_LIB/ext/box2dweb.2.1a-pc.js >> ${OUT_FILE}

cat $PLAYCRAFT_LIB/boot.js >> ${OUT_FILE}
cat $PLAYCRAFT_LIB/playcraft.js >> ${OUT_FILE}
cat $PLAYCRAFT_LIB/input.js >> ${OUT_FILE}
cat $PLAYCRAFT_LIB/hashmap.js >> ${OUT_FILE}
cat $PLAYCRAFT_LIB/tools.js >> ${OUT_FILE}
cat $PLAYCRAFT_LIB/color.js >> ${OUT_FILE}
cat $PLAYCRAFT_LIB/debug.js >> ${OUT_FILE}
cat $PLAYCRAFT_LIB/device.js >> ${OUT_FILE}
cat $PLAYCRAFT_LIB/sound.js >> ${OUT_FILE}
cat $PLAYCRAFT_LIB/layer.js >> ${OUT_FILE}
cat $PLAYCRAFT_LIB/entitylayer.js >> ${OUT_FILE}
cat $PLAYCRAFT_LIB/tileset.js >> ${OUT_FILE}
cat $PLAYCRAFT_LIB/tilemap.js >> ${OUT_FILE}
cat $PLAYCRAFT_LIB/tilelayer.js >> ${OUT_FILE}
cat $PLAYCRAFT_LIB/isotilelayer.js >> ${OUT_FILE}
cat $PLAYCRAFT_LIB/hextilelayer.js >> ${OUT_FILE}
cat $PLAYCRAFT_LIB/entity.js >> ${OUT_FILE}
cat $PLAYCRAFT_LIB/sprite.js >> ${OUT_FILE}
cat $PLAYCRAFT_LIB/spritesheet.js >> ${OUT_FILE}
cat $PLAYCRAFT_LIB/math.js >> ${OUT_FILE}
cat $PLAYCRAFT_LIB/image.js >> ${OUT_FILE}
cat $PLAYCRAFT_LIB/scene.js >> ${OUT_FILE}
cat $PLAYCRAFT_LIB/game.js >> ${OUT_FILE}
cat $PLAYCRAFT_LIB/loader.js >> ${OUT_FILE}
cat $PLAYCRAFT_LIB/dataresource.js >> ${OUT_FILE}
cat $PLAYCRAFT_LIB/components/component.js >> ${OUT_FILE}
cat $PLAYCRAFT_LIB/components/physics.js >> ${OUT_FILE}
cat $PLAYCRAFT_LIB/components/alpha.js >> ${OUT_FILE}
cat $PLAYCRAFT_LIB/components/joint.js >> ${OUT_FILE}
cat $PLAYCRAFT_LIB/components/expiry.js >> ${OUT_FILE}
cat $PLAYCRAFT_LIB/components/originshifter.js >> ${OUT_FILE}
cat $PLAYCRAFT_LIB/components/spatial.js >> ${OUT_FILE}
cat $PLAYCRAFT_LIB/components/overlay.js >> ${OUT_FILE}
cat $PLAYCRAFT_LIB/components/clip.js >> ${OUT_FILE}
cat $PLAYCRAFT_LIB/components/activator.js >> ${OUT_FILE}
cat $PLAYCRAFT_LIB/components/input.js >> ${OUT_FILE}
cat $PLAYCRAFT_LIB/components/fade.js >> ${OUT_FILE}
cat $PLAYCRAFT_LIB/components/spin.js >> ${OUT_FILE}
cat $PLAYCRAFT_LIB/components/scale.js >> ${OUT_FILE}
cat $PLAYCRAFT_LIB/components/rect.js >> ${OUT_FILE}
cat $PLAYCRAFT_LIB/components/poly.js >> ${OUT_FILE}
cat $PLAYCRAFT_LIB/components/circle.js >> ${OUT_FILE}
cat $PLAYCRAFT_LIB/components/text.js >> ${OUT_FILE}
cat $PLAYCRAFT_LIB/components/sprite.js >> ${OUT_FILE}
cat $PLAYCRAFT_LIB/components/layout.js >> ${OUT_FILE}
cat $PLAYCRAFT_LIB/components/particleemitter.js >> ${OUT_FILE}
cat $PLAYCRAFT_LIB/systems/system.js >> ${OUT_FILE}
cat $PLAYCRAFT_LIB/es/entitymanager.js >> ${OUT_FILE}
cat $PLAYCRAFT_LIB/es/systemmanager.js >> ${OUT_FILE}
cat $PLAYCRAFT_LIB/systems/entitysystem.js >> ${OUT_FILE}
cat $PLAYCRAFT_LIB/systems/physics.js >> ${OUT_FILE}
cat $PLAYCRAFT_LIB/systems/effects.js >> ${OUT_FILE}
cat $PLAYCRAFT_LIB/systems/particles.js >> ${OUT_FILE}
cat $PLAYCRAFT_LIB/systems/input.js >> ${OUT_FILE}
cat $PLAYCRAFT_LIB/systems/expiry.js >> ${OUT_FILE}
cat $PLAYCRAFT_LIB/systems/activation.js >> ${OUT_FILE}
cat $PLAYCRAFT_LIB/systems/render.js >> ${OUT_FILE}
cat $PLAYCRAFT_LIB/systems/layout.js >> ${OUT_FILE}

> ${OUT_MIN_FILE}
java -jar yuicompressor-2.4.7.jar ${OUT_FILE} -v -o ${OUT_MIN_FILE}
