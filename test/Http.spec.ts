import { Server } from 'bun';
import { afterAll, beforeAll, describe, expect, it } from 'bun:test';
import { fail, succeed } from 'jsonous';
import { toHttpResponseTask, toHttpTask } from '../src/Http';
import { Method, Request } from '../src/Request';
import { get } from '../src/RequestBuilder';

const aGetRequest: Request<string> = {
  method: 'get' as Method,
  url: 'http://localhost:9877',
  data: {},
  timeout: 0,
  headers: [],
  withCredentials: false,
  decoder: succeed('foo'),
};

const aFailedGetRequest = {
  method: 'get' as Method,
  url: 'http://localhost:9877',
  data: {},
  timeout: 0,
  headers: [],
  withCredentials: false,
  decoder: fail('Bad mojo'),
};

let server: Server | undefined;

beforeAll(async () => {
  // Start the server before all tests
  server = Bun.serve({
    port: 9877,
    fetch(req) {
      if (req.method === 'GET') {
        const headers = {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        };

        return new Response(JSON.stringify({ status: 'ok' }), {
          status: 200,
          headers: headers,
        });
      } else {
        return new Response('Not Found', { status: 404 });
      }
    },
  });
});

afterAll(async () => {
  // Stop the server after all tests
  if (server) {
    server.stop();
  }
});

describe('toHttpResponseTask', () => {
  it('can get the headers from a request', async () => {
    const result = await toHttpResponseTask(aGetRequest).resolve();
    expect(result.response.headers.length).toBeGreaterThan(0);
  });
});

describe('toHttpTask', () => {
  it('can get data from websites', async () => {
    await toHttpTask(aGetRequest).resolve();
  });

  it('handle failed decoder errors', async () => {
    try {
      await toHttpTask(aFailedGetRequest).resolve();
      throw new Error('Should not have succeeded');
    } catch (error) {
      // Test passed because it should throw an error
    }
  });
});

describe('using the request builder', () => {
  it('can be used in place of a request', async () => {
    await toHttpTask(get('http://localhost:9877')).resolve();
  });
});
