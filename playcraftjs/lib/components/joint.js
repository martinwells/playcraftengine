
pc.JointType = {

    WELD: 0,
    REVOLUTE: 1,
    DISTANCE: 2
};

pc.components.Joint = pc.components.Component.extend('pc.components.Joint',
    {
        create: function(options)
        {
            var n = this._super();
            n.config(options);
            return n;
        }
    },
    {
        attachTo: null,
        offset: null,
        attachmentOffset: null,
        distance: 0,
        type: 0,

        // distance joints
        frequency: 0,
        dampingRatio: 0,

        // revolute joints
        angle: 0,   // starting angle of the joint
        lowerAngleLimit: 0,
        upperAngleLimit: 0,
        enableLimit: false,
        maxMotorTorque: 0,
        enableMotor: 0,
        motorSpeed: 0,

        _joint: null,

        init: function(options)
        {
            this._super(this.Class.shortName);
            this.offset = pc.Point.create(0,0);
            this.attachmentOffset = pc.Point.create(0,0);
            if (pc.valid(options))
                this.config(options);
        },

        config: function(options)
        {
            this.attachTo = pc.checked(options.attachedTo, null);
            if (options.offset)
                this.offset.setXY(pc.checked(options.offset.x, 0), pc.checked(options.offset.y, 0));
            if (options.attachmentOffset)
                this.attachmentOffset.setXY(pc.checked(options.attachmentOffset.x, 0), pc.checked(options.attachmentOffset.y, 0));

            this.distance = pc.checked(options.distance, 0);
            this.type = pc.checked(options.type, pc.JointType.WELD);

            this.dampingRatio = pc.checked(options.dampingRatio, 0);
            this.lowerAngleLimit = pc.checked(options.lowerAngleLimit, 0);
            this.upperAngleLimit = pc.checked(options.upperAngleLimit, 359);
            this.enableLimit = pc.checked(options.enableLimit, false);
            this.maxMotorTorque = pc.checked(options.maxMotorTorque, 100);
            this.enableMotor = pc.checked(options.enableMotor, false);
            this.motorSpeed = pc.checked(options.motorSpeed, 0);
            this.angle = pc.checked(options.angle, 0);

            this._joint = null;
        },

        getAngle: function()
        {
            return pc.Math.radToDeg(this._joint.GetJointAngle());
        },

        getSpeed: function()
        {
            return this._joint.GetJointSpeed();
        },

        setMotorSpeed: function(s)
        {
            this.motorSpeed = s;
            this._joint.SetMotorSpeed(s);
        },

        getMotorTorque: function()
        {
            return this._joint.GetMotorTorque();
        },

        isLimitEnabled: function()
        {
            return this.enableLimit;
        },

        isMotorEnabled: function()
        {
            return this.enableMotor;
        },

        setMaxMotorTorque: function(m)
        {
            this.maxMotorTorque = m;
            this._joint.SetMaxMotorTorque(m);
        },

        getMaxMotorTorque:function ()
        {
            return this.maxMotorTorque;
        }


    });
