const REGEX_UUID = '^[a-fA-F0-9]{8}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{12}$';

export const isGUID: (test: string) => boolean = test => new RegExp(REGEX_UUID).test(test);
