module.exports = function (grunt)
{
    grunt.file.setBase('../lib/');

    grunt.initConfig(
        {

        min:{
            dist:{
                src:[

                    // externals
                    'packed.js', // included only when packing
                    'ext/jquery171.js',
                    'ext/gamecore.js/src/class.js',
                    'ext/gamecore.js/src/gamecore.js',
                    'ext/gamecore.js/src/jhashtable.js',
                    'ext/gamecore.js/src/device.js',
                    'ext/gamecore.js/src/perf.js',
                    'ext/gamecore.js/src/linkedlist.js',
                    'ext/gamecore.js/src/hashlist.js',
                    'ext/gamecore.js/src/stacktrace.js',
                    'ext/gamecore.js/src/pooled.js',
                    'ext/base64.js',
                    'ext/box2dweb.2.1a-pc.js',

                    // playcraft engine
                    'playcraft.js',
                    'boot.js', // <--- must be first after playcraft.js for engine scripts (sets up some translations)
                    'input.js',
                    'hashmap.js',
                    'tools.js',
                    'color.js',
                    'debug.js',
                    'device.js',
                    'sound.js',
                    'layer.js',
                    'entitylayer.js',
                    'tileset.js',
                    'tilemap.js',
                    'tilelayer.js',
                    'entity.js',
                    'sprite.js',
                    'spritesheet.js',
                    'math.js',
                    'image.js',
                    'scene.js',
                    'game.js',
                    'loader.js',
                    'dataresource.js',
                    'components/component.js',
                    'components/physics.js',
                    'components/alpha.js',
                    'components/joint.js',
                    'components/expiry.js',
                    'components/originshifter.js',
                    'components/debuginfo.js',
                    'components/spatial.js',
                    'components/overlay.js',
                    'components/clip.js',
                    'components/activator.js',
                    'components/input.js',
                    'components/fade.js',
                    'components/rect.js',
                    'components/text.js',
                    'components/sprite.js',
                    'components/layout.js',
                    'components/particleemitter.js',
                    'systems/system.js',
                    'es/entitymanager.js',
                    'es/systemmanager.js',
                    'systems/entitysystem.js',
                    'systems/physics.js',
                    'systems/effects.js',
                    'systems/particles.js',
                    'systems/input.js',
                    'systems/expiry.js',
                    'systems/activation.js',
                    'systems/render.js',
                    'systems/layout.js'
                ],
                dest:'../dist/playcraft-0.5.11.min.js'
            }
        }//,
//        uglify:{
//            mangle:{toplevel:true},
//            squeeze:{dead_code:false},
//            codegen:{quote_keys:true}
//        }

    });

};
