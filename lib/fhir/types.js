var mongoose = require('mongoose');
var valuesets = require('./valuesets');

var types = {
    boolean: Boolean,
    integer: Number,
    decimal: Number,
    base64Binary: String,
    instant: Date,
    string: String,
    uri: String,
    date: Date,
    dateTime: Date,
    code: String,
    oid: String,
    uuid: String,
    id: String,
    xhtml: String
};

/*
 * Complex types
 * */
types.Extension = mongoose.Schema.Types.Mixed;

types.Attachment = {
    contentType: {type: types.code},
    language: types.code,
    data: types.base64Binary,
    url: types.uri,
    size: types.integer,
    hash: types.base64Binary,
    title: types.string
};

types.Coding = {
    system: types.string,
    version: types.string,
    code: types.string,
    display: types.string,
    primary: types.boolean
};

types.CodeableConcept = {
    coding: [types.Coding],
    text: types.string
};

types.Quantity = {
    value: types.decimal,
    comparator: {type: types.code, enum: valuesets.quantity_comparator},
    units: types.string,
    system: types.uri,
    code: types.code
};

types.Age = types.Quantity;
types.Count = types.Quantity;
types.Money = types.Quantity;
types.Distance = types.Quantity;
types.Duration = types.Quantity;

types.Range = {
    low: types.Quantity,
    high: types.Quantity
};

types.Ratio = {
    numerator: types.Quantity,
    denominator: types.Quantity
};

types.Period = {
    start: types.dateTime,
    end: types.dateTime
};

types.SampledData = {
    origin: types.Quantity,
    period: types.decimal,
    factor: types.decimal,
    lowerLimit: types.decimal,
    upperLimit: types.decimal,
    dimensions: types.integer,
    data: types.string
};

/* types.resourceReference out of order as has dependent schemas */
types.ResourceReference = {
    reference: types.string,
    display: types.string
};

types.Identifier = {
    use: {type: types.string, enum: valuesets.identifier_use},
    label: types.string,
    system: types.string,
    value: types.string,
    period: types.Period,
    assigner: types.ResourceReference
};

types.HumanName = {
    use: {type: types.string, enum: valuesets.name_use},
    text: types.string,
    family: [types.string],
    given: [types.string],
    prefix: [types.string],
    suffix: [types.string],
    period: types.Period
};

types.Address = {
    use: {type: types.string, enum: valuesets.address_use},
    text: types.string,
    line: [types.string],
    city: types.string,
    state: types.string,
    zip: types.string,
    country: types.string,
    period: types.Period
};

types.Contact = {
    system: {type: types.string, enum: valuesets.contact_system},
    value: types.string,
    use: {type: types.string, enum: valuesets.contact_use},
    period: types.Period
};

types.Repeat = {
    frequency: types.integer,
    when: {type: types.code, enum: valuesets.event_timing},
    duration: {type: types.integer},
    units: {type: types.code, enum: valuesets.units_of_time},
    count: types.integer,
    end: types.dateTime
};

types.Schedule = {
    event: [types.Period],
    repeat: types.Repeat
};

types.Narrative = {
    status: {type: types.code, enum: valuesets.narrative_status},
    div: types.xhtml
};

types.Resource = mongoose.Schema.Types.Mixed;

module.exports = exports = types;