import net from 'net';

/**
 * Wait for a TCP port to be open.
 * @param {number} port
 * @param {number} timeoutMs
 * @returns {Promise<void>}
 */
export async function waitForPort(port, timeoutMs = 60000) {
  const start = Date.now();
  return new Promise((resolve, reject) => {
    function tryConnect() {
      const socket = net.connect(port, 'localhost');
      socket.once('connect', () => {
        socket.end();
        resolve();
      });
      socket.once('error', () => {
        socket.destroy();
        if (Date.now() - start > timeoutMs) {
          reject(new Error(`Timeout waiting for port ${port}`));
        } else {
          setTimeout(tryConnect, 250);
        }
      });
    }
    tryConnect();
  });
}
