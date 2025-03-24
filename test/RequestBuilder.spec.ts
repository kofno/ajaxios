import { describe, expect, it } from 'bun:test';
import { fail, succeed } from 'jsonous';
import { Result } from 'resulty';
import { Header } from '../src/Headers';
import { del, get, post, put } from '../src/RequestBuilder';

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

describe('RequestBuilder', () => {
  it('should create a RequestBuilder with default values', () => {
    const builder = get('http://example.com');
    expect(builder.url).toBe('http://example.com');
    expect(builder.method).toBe('get');
    expect(builder.data).toBe('');
    expect(builder.timeout).toBe(0);
    expect(builder.headers).toEqual([]);
    expect(builder.withCredentials).toBe(true);
    expectSuccess(builder.decoder.decodeAny({}), {});
  });

  it('should create a RequestBuilder with post default values', () => {
    const builder = post('http://example.com');
    expect(builder.url).toBe('http://example.com');
    expect(builder.method).toBe('post');
    expect(builder.data).toEqual({});
    expect(builder.timeout).toBe(0);
    expect(builder.headers).toEqual([]);
    expect(builder.withCredentials).toBe(true);
    expectSuccess(builder.decoder.decodeAny({}), {});
  });

  it('should create a RequestBuilder with put default values', () => {
    const builder = put('http://example.com');
    expect(builder.url).toBe('http://example.com');
    expect(builder.method).toBe('put');
    expect(builder.data).toEqual({});
    expect(builder.timeout).toBe(0);
    expect(builder.headers).toEqual([]);
    expect(builder.withCredentials).toBe(true);
    expectSuccess(builder.decoder.decodeAny({}), {});
  });

  it('should create a RequestBuilder with delete default values', () => {
    const builder = del('http://example.com');
    expect(builder.url).toBe('http://example.com');
    expect(builder.method).toBe('delete');
    expect(builder.data).toEqual({});
    expect(builder.timeout).toBe(0);
    expect(builder.headers).toEqual([]);
    expect(builder.withCredentials).toBe(true);
    expectSuccess(builder.decoder.decodeAny({}), {});
  });

  it('should update data using withData', () => {
    const builder = get('http://example.com').withData({ key: 'value' });
    expect(builder.data).toEqual({ key: 'value' });
  });

  it('should update timeout using withTimeout', () => {
    const builder = get('http://example.com').withTimeout(10000);
    expect(builder.timeout).toBe(10000);
  });

  it('should update withCredentials using setWithCredentials', () => {
    const builder = get('http://example.com').setWithCredentials(false);
    expect(builder.withCredentials).toBe(false);
  });

  it('should update decoder using withDecoder', () => {
    const builder = get('http://example.com').withDecoder(succeed('new'));
    expectSuccess(builder.decoder.decodeAny('new'), 'new');
  });

  it('should update headers using withHeader', () => {
    const header: Header = { field: 'Content-Type', value: 'application/json' };
    const builder = get('http://example.com').withHeader(header);
    expect(builder.headers).toEqual([header]);
  });

  it('should add multiple headers using withHeader', () => {
    const header1: Header = {
      field: 'Content-Type',
      value: 'application/json',
    };
    const header2: Header = { field: 'Authorization', value: 'Bearer token' };
    const builder = get('http://example.com')
      .withHeader(header1)
      .withHeader(header2);
    expect(builder.headers).toEqual([header1, header2]);
  });

  it('should maintain immutability when modifying', () => {
    const builder1 = get('http://example.com');
    const builder2 = builder1.withData({ key: 'value' });

    expect(builder1.data).toBe('');
    expect(builder2.data).toEqual({ key: 'value' });
  });

  it('should allow chaining of modifications', () => {
    const header: Header = { field: 'Content-Type', value: 'application/json' };
    const builder = get('http://example.com')
      .withData({ key: 'value' })
      .withTimeout(10000)
      .setWithCredentials(false)
      .withHeader(header)
      .withDecoder(succeed(123));

    expect(builder.data).toEqual({ key: 'value' });
    expect(builder.timeout).toBe(10000);
    expect(builder.withCredentials).toBe(false);
    expect(builder.headers).toEqual([header]);
    expectSuccess(builder.decoder.decodeAny(123), 123);
  });

  it('should handle a failing decoder', () => {
    const builder = get('http://example.com').withDecoder(
      fail('Failed to decode'),
    );
    expectError(builder.decoder.decodeAny('anything'), 'Failed to decode');
  });
});
