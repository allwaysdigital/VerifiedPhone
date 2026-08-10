const React = require('react');

const Camera = React.forwardRef((props, ref) => React.createElement('Camera', { ...props, ref }));

const CameraType = { Back: 'back', Front: 'front' };

module.exports = { Camera, CameraType };
