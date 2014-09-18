var valuesets = {};

valuesets.quantity_comparator = ['<', '<=', '>=', '>'];
valuesets.identifier_use = ['usual', 'official', 'temp', 'secondary'];
valuesets.name_use = ['usual', 'official', 'temp', 'nickname', 'anonymous', 'old', 'maiden'];
valuesets.address_use = ['home', 'work', 'temp', 'old'];
valuesets.contact_system = ['phone', 'fax', 'email', 'url'];
valuesets.contact_use = ['home', 'work', 'temp', 'old', 'mobile'];
valuesets.event_timing = ['HS', 'WAKE', 'AC', 'ACM', 'ACD', 'ACV', 'PC', 'PCM', 'PCD', 'PCV'];
valuesets.units_of_time = ['s', 'min', 'h', 'd', 'wk', 'mo', 'a'];
valuesets.narrative_status = ['generated', 'extensions', 'additional'];

valuesets['MaritalStatus'] = ['U','A','D','I','L','M','P','S','T','W','UNK'];
valuesets['AdministrativeGender'] = ['F', 'M', 'UN', 'UNK'];

valuesets['LinkType'] = ['replace', 'refer', 'seealso'];
valuesets['SecurityEventAction'] = ['C', 'R', 'U', 'D', 'E'];

module.exports = exports = valuesets;