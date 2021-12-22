const waSocket = require('./wa-socket');
const delay = require('delay');
const { insertMessage } = require('./db');

const send = async (sessionId, number, text, forceRestart = false, i = 1) => {
    console.log(`[ SEND ]`, JSON.stringify({sessionId, number, text, forceRestart, i}))
    try {
        const sock = waSocket(sessionId, {}, forceRestart);
        let sentMsg = null;

        await delay(3000);

        sentMsg = await sock.sendMessage(`${number}@s.whatsapp.net`, { text })
        insertMessage({ ...sentMsg, sessionId });

        await delay(1000);
        return sentMsg
    } catch (error) {
        const errMsg = error?.message?.toLowerCase() || '';
        console.log(`[ SEND ERROR ]`, errMsg);
        if ((errMsg.includes('timeout') || errMsg.includes('websocket is not open') || errMsg.includes('timed out')) && i < 3) {
            console.log('[ SEND RETRY ]', `Retrying ${i}`);
            return send(sessionId, number, text, true, i + 1);
        }
        throw error;
    }
}

module.exports = send;