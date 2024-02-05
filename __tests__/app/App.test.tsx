import renderer from 'react-test-renderer';
import App from '@src/app/_layout';
import React from 'react';

it('renders correctly', () => {
  const tree = renderer.create(<App />).toJSON();
  expect(tree).toMatchSnapshot();
});