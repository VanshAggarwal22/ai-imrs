import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import nodemailer from 'nodemailer';

vi.mock('sqlite3', () => ({
  default: {
    Database: class Database {
      constructor(path, callback) {
        if (callback) {
           process.nextTick(() => callback(null));
        }
      }
      run(sql, params, cb) {
          if (typeof params === 'function') cb = params;
          if (cb) process.nextTick(() => cb(null));
          return this;
      }
      all(sql, params, cb) {
          if (typeof params === 'function') cb = params;
          if (cb) process.nextTick(() => cb(null, []));
          return this;
      }
      get(sql, params, cb) {
          if (typeof params === 'function') cb = params;
          if (cb) process.nextTick(() => cb(null, null));
          return this;
      }
      close(cb) {
          if (cb) process.nextTick(() => cb(null));
          return this;
      }
    }
  }
}));

vi.mock('nodemailer');

import { app } from './server.js';

describe('POST /api/send-email', () => {
  let mockSendMail;

  beforeEach(() => {
    vi.clearAllMocks();
    mockSendMail = vi.fn().mockResolvedValue({ messageId: 'test-message-id' });
    nodemailer.createTransport.mockReturnValue({
      sendMail: mockSendMail,
    });
  });

  const validPayload = {
    smtpHost: 'smtp.example.com',
    smtpPort: 587,
    smtpUser: 'user@example.com',
    smtpPass: 'password',
    to: 'recipient@example.com',
    subject: 'Test Subject',
    html: '<p>Test HTML</p>',
  };

  it('should successfully send an email with valid parameters', async () => {
    const response = await request(app)
      .post('/api/send-email')
      .send(validPayload);

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ success: true, messageId: 'test-message-id' });

    expect(nodemailer.createTransport).toHaveBeenCalledWith({
      host: 'smtp.example.com',
      port: 587,
      secure: false,
      auth: {
        user: 'user@example.com',
        pass: 'password',
      },
    });

    expect(mockSendMail).toHaveBeenCalledWith({
      from: '"IMRS System" <user@example.com>',
      to: 'recipient@example.com',
      subject: 'Test Subject',
      html: '<p>Test HTML</p>',
      replyTo: 'user@example.com',
      attachments: [],
    });
  });

  it('should return 400 Bad Request if smtpHost is missing', async () => {
    const { smtpHost, ...payloadWithoutHost } = validPayload;

    const response = await request(app)
      .post('/api/send-email')
      .send(payloadWithoutHost);

    expect(response.status).toBe(400);
    expect(response.body).toEqual({ error: 'Missing SMTP configuration parameters.' });
    expect(nodemailer.createTransport).not.toHaveBeenCalled();
  });

  it('should return 400 Bad Request if smtpUser is missing', async () => {
    const { smtpUser, ...payloadWithoutUser } = validPayload;

    const response = await request(app)
      .post('/api/send-email')
      .send(payloadWithoutUser);

    expect(response.status).toBe(400);
    expect(response.body).toEqual({ error: 'Missing SMTP configuration parameters.' });
    expect(nodemailer.createTransport).not.toHaveBeenCalled();
  });

  it('should return 400 Bad Request if smtpPass is missing', async () => {
    const { smtpPass, ...payloadWithoutPass } = validPayload;

    const response = await request(app)
      .post('/api/send-email')
      .send(payloadWithoutPass);

    expect(response.status).toBe(400);
    expect(response.body).toEqual({ error: 'Missing SMTP configuration parameters.' });
    expect(nodemailer.createTransport).not.toHaveBeenCalled();
  });

  it('should return 500 Internal Server Error if sending fails', async () => {
    mockSendMail.mockRejectedValueOnce(new Error('SMTP connection failed'));

    const response = await request(app)
      .post('/api/send-email')
      .send(validPayload);

    expect(response.status).toBe(500);
    expect(response.body).toEqual({ error: 'SMTP connection failed' });
  });

  it('should return 500 with default error message if error has no message', async () => {
    mockSendMail.mockRejectedValueOnce('Unknown Error String');

    const response = await request(app)
      .post('/api/send-email')
      .send(validPayload);

    expect(response.status).toBe(500);
    expect(response.body).toEqual({ error: 'Failed to send email' });
  });

  it('should use default SMTP port 587 if not provided', async () => {
    const payloadWithoutPort = { ...validPayload };
    delete payloadWithoutPort.smtpPort;

    await request(app)
      .post('/api/send-email')
      .send(payloadWithoutPort);

    expect(nodemailer.createTransport).toHaveBeenCalledWith(
      expect.objectContaining({ port: 587 })
    );
  });

  it('should use secure true if port is 465', async () => {
    await request(app)
      .post('/api/send-email')
      .send({ ...validPayload, smtpPort: 465 });

    expect(nodemailer.createTransport).toHaveBeenCalledWith(
      expect.objectContaining({ port: 465, secure: true })
    );
  });
});
