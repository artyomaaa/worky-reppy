import { pathMatchRegexp } from './index'
import pathToRegexp from 'path-to-regexp'

describe('test pathMatchRegexp', () => {
  it('get right', () => {
    expect(pathMatchRegexp('/users', '/zh/users')).toEqual(
      pathToRegexp('/users').exec('/users')
    );
    expect(pathMatchRegexp('/users', '/users')).toEqual(
      pathToRegexp('/users').exec('/users')
    );

    expect(pathMatchRegexp('/user/:id', '/zh/users/1')).toEqual(
      pathToRegexp('/users/:id').exec('/users/1')
    );
    expect(pathMatchRegexp('/user/:id', '/users/1')).toEqual(
      pathToRegexp('/users/:id').exec('/users/1')
    )
  })
});
