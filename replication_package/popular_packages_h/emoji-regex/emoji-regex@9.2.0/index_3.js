"use strict";

function getEmojiRegex() {
    // This regex is derived from Unicode emoji specifications
    // Reference link: https://mths.be/emoji
    return /(?:(?:\uD83C[\uDDE6-\uDDFF]){2}|\uD83C[\uDFF3\uDFFC\uDFFD\uDFFE\uDFFF\uDFF0\uDFF1\uDFF5]+\u200D?\u26F9?\uFE0F?)|\uD83D[\uDC19\uDC41\uDC42\uDC43\uDC66\uDC67\uDC68\uDC69\uDC7C\uDD25\uDEC0\uDECC]+(?:\uD83C?\uDFFE)?[\u270F\u2712]?|\uD83E[\uDD13\uDD26\uDD30-\uDD39\uDD3C-\uDD3E]+(?:\u200D(?:\u2640|\u2642))?|[\u231B\u23CF]+[\uFE0F]?|[\xA9\xAE\u2122\u2123\u2139\u2194-\u2199\u21A9-\u21AA\u23E9-\u23EC\u23F3]+[\uFE0F]|[\u2600-\u26FF\u27B0\u1F170-\u1F171\u1F17E-\u1F17F\u1F191-\u1F19A\u1F1E6-\u1F1FF\u1F201\u1F202\u1F21A\u1F22F\u1F232-\u1F236\u1F238-\u1F23A\u1F250-\u1F251\u1F300-\u1F320\u1F32D-\u1F335\u1F337-\u1F37C\u1F380-\u1F393\u1F3A0-\u1F3CA\u1F3CF-\u1F3D3\u1F3E0-\u1F3ED\u1F3F0-\u1F3F2\u1F400-\u1F4FD\u1F4FF-\u1F53D\u1F54B-\u1F54C\u1F550-\u1F567\u1F57A\u1F595-\u1F596\u1F5A4?|\uD83C\uDFF4[0-9]-?\uFE0F?)|\u2764?[\uFE0F]?|(?:[^\u00C0-\u1FFF]+[-\x2B0-\xAF]?\xA7\u00A9\u00AE+)+/g;
}

module.exports = getEmojiRegex;