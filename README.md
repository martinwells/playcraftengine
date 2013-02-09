## 0.5.6

- hex tile maps now supported using (pc.HexTileLayer)
- spritesheets can now have frame relative draw offsets
- all components now have an active flag which disables a component, without having to remove it (e.g. entity.getComponent('fade').active = false)
- new input type DEVICE_ORIENTATION added to input.js (thanks natchiketa)
- yourgame sample project now demonstrates how to do multiple scenes and a simple menu system
- yourgame sample project is more organized (moving towards it being a template)
- a compatibility fix was added for IE9+ (property clones required init's -- still working on tracking down the issue)
- fixed IE not wanting to load base64 encoded XML (i.e. levels in Scrollia)
- fixed the timer function for non-animation frame browsers (IE)
- components now use a static type naming, rather than dynamic this.Class.shortName to avoid inheritance typing issues
- a new demo: customcomponent added to show a simple example of a mousehover (thanks Leandro)
- MOUSE_LEFT_BUTTON and MOUSE_RIGHT_BUTTON are now MOUSE_BUTTON_LEFT_UP, MOUSE_BUTTON_LEFT_DOWN etc (thanks Leandro)
- fixed pc.SpriteSheet image option left out of the API call docs
- you can now set the friction and linear damping of physics components at runtime (setFriction and setLinearDamping)
- pc.Image.resize exposed in the API. setScale has some better docs on how to scale to a particular pixel size
- fixed bug in entity.removeTag
- fixes for scaling (thanks David)
- fixed fade component not correctly looping infinitely (when loops:0 used)
- when adding a scene you can now specify to not make it active - addScene(scene, false);
- loader will now correctly call onLoaded callback if no resources are being loaded
- fixed a bug in pc.Point.dirTo not returning correct angles in some cases

## 0.5.5

- fixed scrollia demo level1.tmx not loading correct tileset path
- pc.Poly shape class added to math.js
- Slopes for tile maps - Tiled integration support arbitrary polygons
- physics.setLinearVelocity and setAngularVelocity now also wakes up the physics body
- added device iPod and iOS detection (pc.device.isiPod and pc.device.isiOS)
- sound is by default disabled on iOS devices (we're working on methods to help with sound on mobile safari)
- pc.Sprite and pc.SpriteSheet API docs were not linked in the API list
- fixed a bug when loading resources that have mixed case resource names (thanks Jett)
- fixed pc.systems.EntitySystem API docs (and added it to the API list)
- fixed bug in togglePauseResume (thanks Jett)
- fixed pc.DataResources not loading on some Firefox versions
- scrollia demo is now organized into separate files/folders
- fixed add/sub color bug in pc.Color (thanks Eemeli)

## 0.5.4

- pc.Tools.arrayRemove fixed if multiples of the same element exist (thanks im007boy)
- spin effects added (pc.components.Spin)
- scale effects added (pc.components.Scale)
- input component actions bug fix
- spatial and physics are now synced

## 0.5.3

- onResize fixed
- input components can now take an optional 'target' entity, where states and actions will be set/sent.
- minor fixes to touch input handling
- Scrollia demo updated to show how to implement touch controls
- Polygon drawing component added - pc.components.Poly
- Circle drawing component added - pc.components.Circle

## 0.5.2

- jQuery dependencies have been removed, and jQuery is no longer included with the engine. Most of the changes are in
the gamecore class structuring. We needed to do this to increase compatibility with the iOS accelerator and some SmartTV
setups. And generally a desire to not depend on other libraries where possible. The good news is we save 100+K on the
minified build. You'll need to manually include jquery from now on if you need it.
- gamecore base class moved to it's own file (gamecore/src/base.js)
- gamecore load ordering changed (now: gamecore.js, class.js then base.js)
