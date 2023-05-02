const barStyle = {
  height: '20px',
  width: '100%',
  borderRadius: '10px',
  backgroundColor: '#ddd',
  marginTop: '10px',
  position: 'relative',
  overflow: 'hidden',
};

const Bar = ({decibels}) => {
  const barColor = decibels < 70 ? 'blue' : decibels < 100 ? 'yellow' : 'red';

  const barFillStyle = {
    height: '100%',
    width: `${decibels}%`,
    backgroundColor: barColor,
    transition: 'width 0.2s ease-in-out',
  };

  return (
    <div style={barStyle}>
      <div style={barFillStyle}></div>
    </div>
  );
};

export default Bar;
