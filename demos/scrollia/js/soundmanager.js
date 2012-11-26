/**
 * A simple sound manager to take care of finding sounds by name, holding references and setting volume
 * (plus detecting if sound is enabled in one play)
 * @type {*}
 */
SoundManager = pc.Base.extend('SoundManager',
    { },
    {
        sounds:null,

        init:function ()
        {
            if (pc.device.soundEnabled)
            {
                this.sounds = new pc.Hashmap();

                // volume adjustments
                pc.device.loader.get('fireball-cast').resource.setVolume(0.5);
                pc.device.loader.get('fireball-explode').resource.setVolume(0.8);
                pc.device.loader.get('wood-explode').resource.setVolume(0.2);
                pc.device.loader.get('sword-swing').resource.setVolume(0.5);
                pc.device.loader.get('zombie-alert').resource.setVolume(0.3);
                pc.device.loader.get('zombie-brains').resource.setVolume(0.3);
                pc.device.loader.get('player-pain1').resource.setVolume(0.8);
                pc.device.loader.get('player-pain2').resource.setVolume(0.8);
                pc.device.loader.get('blood-hit1').resource.setVolume(0.8);
                pc.device.loader.get('blood-hit2').resource.setVolume(0.8);

                // add them to the lookup map for quick access
                // todo: replace this by for looping through pc.device.loader.getAllSounds()
                this.sounds.put('fireball-cast', pc.device.loader.get('fireball-cast').resource);
                this.sounds.put('fireball-explode', pc.device.loader.get('fireball-explode').resource);
                this.sounds.put('wood-explode', pc.device.loader.get('wood-explode').resource);
                this.sounds.put('sword-swing', pc.device.loader.get('sword-swing').resource);
                this.sounds.put('zombie-alert', pc.device.loader.get('zombie-alert').resource);
                this.sounds.put('zombie-brains', pc.device.loader.get('zombie-brains').resource);
                this.sounds.put('player-pain1', pc.device.loader.get('player-pain1').resource);
                this.sounds.put('player-pain2', pc.device.loader.get('player-pain2').resource);
                this.sounds.put('blood-hit1', pc.device.loader.get('blood-hit1').resource);
                this.sounds.put('blood-hit2', pc.device.loader.get('blood-hit2').resource);
            }
        },

        play:function (sound)
        {
            if (!pc.device.soundEnabled)
                return;

            var s = this.sounds.get(sound);
            if (!s) throw 'Oops, invalid sound name: ' + sound;
            s.play();
        }

    });

