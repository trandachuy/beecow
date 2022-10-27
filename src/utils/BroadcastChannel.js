/*
 * Copyright 2017 (C) Mediastep Software Inc.
 *
 * Created on : 29/5/2019
 * Author: Dai Mai <email: dai.mai@mediastep.com>
 */

import '../broadcast-channel';

const createBroadcastChannel = (channelName) => {
    return new window.top.BroadcastChannel(channelName);
};

export const BroadcastChannelUtil = {
    createBroadcastChannel
};
