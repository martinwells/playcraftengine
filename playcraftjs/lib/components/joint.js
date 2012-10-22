/**
 * Playcraft Engine - (C)2012 Playcraft Labs, Inc.
 * See licence.txt for details
 */

pc.JointType = {
    WELD:0,
    REVOLUTE:1,
    DISTANCE:2
};

/**
 * @class pc.components.Joint
 * @description
 * [Extends <a href='pc.components.Component'>pc.components.Component</a>]<BR>
 * [Used in <a href='pc.systems.Physics'>pc.systems.Physics</a>]
 * <p>
 * Creates a joint that holds to physics entities together.
 */
pc.components.Joint = pc.components.Component.extend('pc.components.Joint',
    /** @lends pc.components.Joint */
    {
        /**
         * Construct (or acquires) a new component with the options supplied
         * @param {pc.Entity} options.attachTo Entity to attach the joint to
         * @param {pc.Dim} options.offset Dim x, y of the pixel offset the joint is relative to the source entity
         * @param {pc.Dim} options.attachmentOffset Dim x, y of the offset of the joint on the attached entity
         * @param {Number} options.distance How long the joint is
         * @param {pc.JointType} options.type Type of joint (pc.JointType.WELD, pc.JointType.REVOLUTE, pc.JointType.DISTANCE)
         * @param {Number} options.dampingRatio Ratio for damping motion
         * @param {Number} options.lowerAngleLimit Limit angular movement this angle at the lowest
         * @param {Number} options.upperAngleLimit Limit angular movement this angle at the highest
         * @param {Boolean} options.enableLimit True is anglular limiting is enabled
         * @param {Number} options.maxMotorTorque Highest torque that motor can power to
         * @param {Number} options.motorSpeed Speed of the motor that drives joint turn
         * @param {Boolean} options.enableMotor Whether to engage the motor
         * @param {Number} options.angle Angle of the joint
         * @return {pc.components.Joint} A configured joint component
         */
        create:function (options)
        {
            var n = this._super();
            n.config(options);
            return n;
        }
    },
    /** @lends pc.components.Joint.prototype */
    {
        /** The entity this joint attaches to */
        attachTo:null,
        /** Position offset of the joint on the source entity */
        offset:null,
        /** Position offset of the joint on the atached to entity */
        attachmentOffset:null,
        /** Distance / length of the joint */
        distance:0,
        /** Type of joint -- see pc.JointType */
        type:0,

        /** Frequency of the joint (distance joints only) */
        frequency:0,
        /** Damping ratio (distance joints only) */
        dampingRatio:0,

        /** Angle of the joint (revolute joints only) */
        angle:0,
        /** Lower angle limit (revolute joints only) */
        lowerAngleLimit:0,
        /** Upper angle limit (revolute joints only) */
        upperAngleLimit:0,
        /** Whether angule limiting is in play (revolute joints only) */
        enableLimit:false,
        /** Maxmium torque of the motor (revolute joints only) */
        maxMotorTorque:0,
        /** Whether the motor is enabled (revolute joints only) */
        enableMotor:0,
        /** Speed of the motor (revolute joints only) */
        motorSpeed:0,

        _joint:null,

        /**
         * Constructs a new joint (via new). See create method for options details.
         */
        init:function (options)
        {
            this._super(this.Class.shortName);
            this.offset = pc.Point.create(0, 0);
            this.attachmentOffset = pc.Point.create(0, 0);
            if (pc.valid(options))
                this.config(options);
        },

        /**
         * Configures a joint. See create method for options details.
         */
        config:function (options)
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

        /**
         * Gets the current angle of the joint
         * @return {Number} Angle
         */
        getAngle:function ()
        {
            return pc.Math.radToDeg(this._joint.GetJointAngle());
        },

        /**
         * Gets the current speed of the motor
         * @return {Number} Current speed
         */
        getSpeed:function ()
        {
            return this._joint.GetJointSpeed();
        },

        /**
         * Sets the motor speed
         * @param {Number} s Speed
         */
        setMotorSpeed:function (s)
        {
            this.motorSpeed = s;
            this._joint.SetMotorSpeed(s);
        },

        /**
         * Gets the current torque of the motor
         * @return {Number} Torque
         */
        getMotorTorque:function ()
        {
            return this._joint.GetMotorTorque();
        },

        /**
         * Gets whether the angle limits are on
         * @return {Boolean} True is they are on
         */
        isLimitEnabled:function ()
        {
            return this.enableLimit;
        },

        /**
         * Gets whether the motor is presently enabled
         * @return {Boolean} True is the motor is enabled
         */
        isMotorEnabled:function ()
        {
            return this.enableMotor;
        },

        /**
         * Sets the max motor torque level (how fast she'll spin)
         * @param {Number} m Maxium
         */
        setMaxMotorTorque:function (m)
        {
            this.maxMotorTorque = m;
            this._joint.SetMaxMotorTorque(m);
        },

        /**
         * Gets the current max motor torque
         * @return {Number} The max
         */
        getMaxMotorTorque:function ()
        {
            return this.maxMotorTorque;
        }


    });
