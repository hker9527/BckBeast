const Long = require('long');

var SFUtil = {
    pad: (v, n, c = '0') => {
        return String(v).length >= n ? String(v) : (String(c).repeat(n) + v).slice(-n);
    },
    EPOCH: 1420070400000,
    gen: (time = null) => {
        var timestamp = +new Date();
        if (time !== null) {
            timestamp = Date.parse(time)
            if (!timestamp) return false;
        }
        const BINARY = `${SFUtil.pad((timestamp - SFUtil.EPOCH).toString(2), 42)}0000100000000000000001`;
        return Long.fromString(BINARY, 2).toString();
    },
    dec: (sf) => {
        const BINARY = SFUtil.pad(Long.fromString(sf).toString(2), 64);
        const res = {
            timestamp: parseInt(BINARY.substring(0, 42), 2) + SFUtil.EPOCH,
            workerID: parseInt(BINARY.substring(42, 47), 2),
            processID: parseInt(BINARY.substring(47, 52), 2),
            increment: parseInt(BINARY.substring(52, 64), 2),
            binary: BINARY,
        };
        Object.defineProperty(res, 'date', {
            get: function get() {
                return new Date(this.timestamp);
            },
            enumerable: true,
        });
        return res;
    }
}

module.exports = SFUtil;
