const express = require('express');
const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);

const shortUrlSchema = mongoose.Schema({
    full:{
        type: String,
        required: true,
    },
    short: {
        type: Number,
        // required: true
    },
    clicks: {
        type: Number,
        // required: true,
    }
})

shortUrlSchema.plugin(AutoIncrement, { inc_field: 'short' });

module.exports = mongoose.model('ShortUrl', shortUrlSchema);