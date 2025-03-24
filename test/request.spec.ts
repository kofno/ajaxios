import { describe, expect, it } from 'bun:test';
import { fail, succeed } from 'jsonous';
import { Result } from 'resulty';
import { Method, Request } from '../src/Request';

function expectSuccess<T>(result: Result<string, T>, expected: T) {
  if (result.isOk()) {
    expect(result.state.value).toEqual(expected);
  } else if (result.isErr()) {
    throw new Error(`Expected success, but got error: ${result.state.error}`);
  }
}

function expectError<T>(result: Result<string, T>, expected: string) {
  if (result.isErr()) {
    expect(result.state.error).toEqual(expected);
  } else if (result.isOk()) {
    throw new Error(`Expected error, but got success: ${result.state.value}`);
  }
}

describe('Request', () => {
  it('should create a valid GET request', () => {
    const request: Request<string> = {
      url: 'http://example.com',
      method: 'get',
      data: {},
      timeout: 5000,
      headers: [{ field: 'Content-Type', value: 'application/json' }],
      withCredentials: true,
      decoder: succeed('success'),
    };

    expect(request.url).toBe('http://example.com');
    expect(request.method).toBe('get');
    expect(request.data).toEqual({});
    expect(request.timeout).toBe(5000);
    expect(request.headers).toEqual([
      { field: 'Content-Type', value: 'application/json' },
    ]);
    expect(request.withCredentials).toBe(true);
    expectSuccess(request.decoder.decodeAny('success'), 'success');
  });

  it('should create a valid POST request', () => {
    const request: Request<number> = {
      url: 'http://example.com/post',
      method: 'post',
      data: { key: 'value' },
      timeout: 10000,
      headers: [],
      withCredentials: false,
      decoder: succeed(123),
    };

    expect(request.url).toBe('http://example.com/post');
    expect(request.method).toBe('post');
    expect(request.data).toEqual({ key: 'value' });
    expect(request.timeout).toBe(10000);
    expect(request.headers).toEqual([]);
    expect(request.withCredentials).toBe(false);
    expectSuccess(request.decoder.decodeAny(123), 123);
  });

  it('should create a valid DELETE request', () => {
    const request: Request<boolean> = {
      url: 'http://example.com/delete',
      method: 'delete',
      data: null,
      timeout: 2000,
      headers: [{ field: 'Authorization', value: 'Bearer token' }],
      withCredentials: true,
      decoder: succeed(true),
    };

    expect(request.url).toBe('http://example.com/delete');
    expect(request.method).toBe('delete');
    expect(request.data).toBe(null);
    expect(request.timeout).toBe(2000);
    expect(request.headers).toEqual([
      { field: 'Authorization', value: 'Bearer token' },
    ]);
    expect(request.withCredentials).toBe(true);
    expectSuccess(request.decoder.decodeAny(true), true);
  });

  it('should handle different HTTP methods', () => {
    const methods: Method[] = [
      'get',
      'post',
      'put',
      'patch',
      'head',
      'options',
      'delete',
    ];
    methods.forEach((method) => {
      const request: Request<string> = {
        url: `http://example.com/${method}`,
        method: method,
        data: {},
        timeout: 3000,
        headers: [],
        withCredentials: false,
        decoder: succeed('ok'),
      };
      expect(request.method).toBe(method);
    });
  });

  it('should handle a failing decoder', () => {
    const request: Request<string> = {
      url: 'http://example.com',
      method: 'get',
      data: {},
      timeout: 5000,
      headers: [],
      withCredentials: false,
      decoder: fail('Failed to decode'),
    };
    expectError(request.decoder.decodeAny('anything'), 'Failed to decode');
  });
});
