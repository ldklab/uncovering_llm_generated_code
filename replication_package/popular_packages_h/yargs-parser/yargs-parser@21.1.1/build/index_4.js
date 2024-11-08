'use strict';

const util = require('util');
const path = require('path');
const fs = require('fs');

function camelCase(str) {
    const isCamelCase = str !== str.toLowerCase() && str !== str.toUpperCase();
    if (!isCamelCase) str = str.toLowerCase();
    
    if (!str.includes('-') && !str.includes('_')) return str;

    let camelcase = '', nextChrUpper = false;
    const leadingHyphens = str.match(/^-+/);
    for (let i = leadingHyphens ? leadingHyphens[0].length : 0; i < str.length; i++) {
        let chr = str.charAt(i);
        if (nextChrUpper) {
            nextChrUpper = false;
            chr = chr.toUpperCase();
        }
        if (i !== 0 && (chr === '-' || chr === '_')) {
            nextChrUpper = true;
        } else if (chr !== '-' && chr !== '_') {
            camelcase += chr;
        }
    }
    return camelcase;
}

function decamelize(str, joinString = '-') {
    return str.toLowerCase().split('').map((chr, i) => {
        const chrLower = chr.toLowerCase();
        return (chrLower !== chr && i > 0) ? `${joinString}${chrLower}` : chr;
    }).join('');
}

function looksLikeNumber(x) {
    if (x == null) return false;
    if (typeof x === 'number') return true;
    if (/^0x[0-9a-f]+$/i.test(x)) return true;
    if (/^0[^.]/.test(x)) return false;
    return /^[-]?(?:\d+(?:\.\d*)?|\.\d+)(e[-+]?\d+)?$/.test(x);
}

function tokenizeArgString(argString) {
    if (Array.isArray(argString)) {
        return argString.map(e => typeof e !== 'string' ? e + '' : e);
    }
    argString = argString.trim();
    let i = 0, prevC = null, c = null, opening = null;
    const args = [];
    for (let ii = 0; ii < argString.length; ii++) {
        prevC = c;
        c = argString.charAt(ii);
        if (c === ' ' && !opening) {
            if (!(prevC === ' ')) i++;
            continue;
        }
        if (c === opening) {
            opening = null;
        } else if ((c === "'" || c === '"') && !opening) {
            opening = c;
        }
        if (!args[i]) args[i] = '';
        args[i] += c;
    }
    return args;
}

const DefaultValuesForTypeKey = {
    BOOLEAN: "boolean",
    STRING: "string",
    NUMBER: "number",
    ARRAY: "array"
};

let mixin;
class YargsParser {
    constructor(_mixin) {
        mixin = _mixin;
    }

    parse(argsInput, options) {
        const opts = Object.assign({
            alias: undefined,
            array: undefined,
            boolean: undefined,
            config: undefined,
            configObjects: undefined,
            configuration: undefined,
            coerce: undefined,
            count: undefined,
            default: undefined,
            envPrefix: undefined,
            narg: undefined,
            normalize: undefined,
            string: undefined,
            number: undefined,
            __: undefined,
            key: undefined
        }, options);

        const args = tokenizeArgString(argsInput);
        const inputIsString = typeof argsInput === 'string';
        const aliases = combineAliases(Object.assign(Object.create(null), opts.alias));
        const configuration = Object.assign({
            'boolean-negation': true,
            'camel-case-expansion': true,
            'combine-arrays': false,
            'dot-notation': true,
            'duplicate-arguments-array': true,
            'flatten-duplicate-arrays': true,
            'greedy-arrays': true,
            'halt-at-non-option': false,
            'nargs-eats-options': false,
            'negation-prefix': 'no-',
            'parse-numbers': true,
            'parse-positional-numbers': true,
            'populate--': false,
            'set-placeholder-key': false,
            'short-option-groups': true,
            'strip-aliased': false,
            'strip-dashed': false,
            'unknown-options-as-args': false
        }, opts.configuration);

        const defaults = Object.assign(Object.create(null), opts.default);
        const configObjects = opts.configObjects || [];
        const envPrefix = opts.envPrefix;

        const notFlagsOption = configuration['populate--'];
        const notFlagsArgv = notFlagsOption ? '--' : '_';
        const newAliases = Object.create(null);
        const defaulted = Object.create(null);
        const __ = opts.__ || mixin.format;
        const flags = {
            aliases: Object.create(null),
            arrays: Object.create(null),
            bools: Object.create(null),
            strings: Object.create(null),
            numbers: Object.create(null),
            counts: Object.create(null),
            normalize: Object.create(null),
            configs: Object.create(null),
            nargs: Object.create(null),
            coercions: Object.create(null),
            keys: []
        };
        const negative = /^-([0-9]+(\.[0-9]+)?|\.[0-9]+)$/;
        const negatedBoolean = new RegExp('^--' + configuration['negation-prefix'] + '(.+)');

        [].concat(opts.array || []).filter(Boolean).forEach(opt => {
            const key = typeof opt === 'object' ? opt.key : opt;
            const assignmentKey = Object.entries({ boolean: 'bools', string: 'strings', number: 'numbers'}).find(([k]) => opt[k])[1];
            if (assignmentKey) {
                flags[assignmentKey][key] = true;
            }
            flags.arrays[key] = true;
            flags.keys.push(key);
        });

        ['boolean', 'string', 'number', 'count', 'normalize'].forEach(optType => {
            [].concat(opts[optType] || []).filter(Boolean).forEach(key => {
                flags[`${optType}s`][key] = true;
                flags.keys.push(key);
            });
        });

        if (typeof opts.narg === 'object') {
            for (const [key, value] of Object.entries(opts.narg)) {
                if (typeof value === 'number') {
                    flags.nargs[key] = value;
                    flags.keys.push(key);
                }
            }
        }

        if (typeof opts.coerce === 'object') {
            for (const [key, value] of Object.entries(opts.coerce)) {
                if (typeof value === 'function') {
                    flags.coercions[key] = value;
                    flags.keys.push(key);
                }
            }
        }

        if (typeof opts.config !== 'undefined') {
            [].concat(opts.config).filter(Boolean).forEach(key => {
                flags.configs[key] = typeof opts.config[key] === 'boolean' ? opts.config[key] : true;
            });
        }

        extendAliases(opts.key, aliases, opts.default, flags.arrays);
        Object.keys(defaults).forEach(key => {
            (flags.aliases[key] || []).forEach(alias => {
                defaults[alias] = defaults[key];
            });
        });

        let error = null;
        checkConfiguration();

        let notFlags = [];
        const argv = Object.assign(Object.create(null), { _: [] });
        const argvReturn = {};

        // Main argument parsing loop
        for (let i = 0; i < args.length; i++) {
            const arg = args[i];
            const truncatedArg = arg.replace(/^-{3,}/, '---');

            processArg(arg, truncatedArg, i, args);

            function processArg(arg, truncatedArg, i, args) {
                let broken, key, m, next, value;

                if (arg !== '--' && /^-/.test(arg) && isUnknownOptionAsArg(arg)) {
                    pushPositional(arg);
                } else if (truncatedArg.match(/^---+(=|$)/)) {
                    pushPositional(arg);
                } else if (arg.match(/^--.+=/) || (!configuration['short-option-groups'] && arg.match(/^-.+=/))) {
                    m = arg.match(/^--?([^=]+)=([\s\S]*)$/);
                    if (m && m.length >= 3) {
                        processEqualsFlag(m, i, args);
                    }
                } else if (arg.match(negatedBoolean) && configuration['boolean-negation']) {
                    handleNegatedBoolean(arg);
                } else if (arg.match(/^--.+/) || (!configuration['short-option-groups'] && arg.match(/^-[^-]+/))) {
                    handleLongOrShortOption(arg, i, args);
                } else if (arg.match(/^-.\..+=/)) {
                    processDotEqualsFlag(arg);
                } else if (arg.match(/^-.\..+/) && !arg.match(negative)) {
                    handleDotNotation(arg, i, args);
                } else if (arg.match(/^-[^-]+/) && !arg.match(negative)) {
                    handleGroupedShortOptions(arg, i, args);
                } else if (arg.match(/^-[0-9]$/) && arg.match(negative) && checkAllAliases(arg.slice(1), flags.bools)) {
                    processStandaloneNegativeNumber(arg);
                } else if (arg === '--') {
                    notFlags = args.slice(i + 1);
                } else if (configuration['halt-at-non-option']) {
                    notFlags = args.slice(i);
                } else {
                    pushPositional(arg);
                }
            }

            function processEqualsFlag(m, i, args) {
                if (checkAllAliases(m[1], flags.arrays)) {
                    i = eatArray(i, m[1], args, m[2]);
                } else if (checkAllAliases(m[1], flags.nargs) !== false) {
                    i = eatNargs(i, m[1], args, m[2]);
                } else {
                    setArg(m[1], m[2], true);
                }
            }

            function handleNegatedBoolean(arg) {
                m = arg.match(negatedBoolean);
                if (m && m.length >= 2) {
                    key = m[1];
                    const defaultValue = checkAllAliases(key, flags.arrays) ? [false] : false;
                    setArg(key, defaultValue);
                }
            }

            function handleLongOrShortOption(arg, i, args) {
                m = arg.match(/^--?(.+)/);
                if (m && m.length >= 2) {
                    key = m[1];
                    if (checkAllAliases(key, flags.arrays)) {
                        i = eatArray(i, key, args);
                    } else if (checkAllAliases(key, flags.nargs) !== false) {
                        i = eatNargs(i, key, args);
                    } else {
                        next = args[i + 1];
                        processNextArgument(next, key, i, args);
                    }
                }
            }

            function processNextArgument(next, key, i, args) {
                if (next !== undefined && (!next.match(/^-/) || next.match(negative)) &&
                    !checkAllAliases(key, flags.bools) && !checkAllAliases(key, flags.counts)) {
                    setArg(key, next);
                    i++;
                } else if (/^(true|false)$/.test(next)) {
                    setArg(key, next);
                    i++;
                } else {
                    setArg(key, defaultValue(key));
                }
            }

            function processDotEqualsFlag(arg) {
                m = arg.match(/^-([^=]+)=([\s\S]*)$/);
                setArg(m[1], m[2]);
            }

            function handleDotNotation(arg, i, args) {
                next = args[i + 1];
                m = arg.match(/^-(.\..+)/);
                if (m && m.length >= 2) {
                    key = m[1];
                    processNextArgumentForDot(key, i, args, next);
                }
            }

            function processNextArgumentForDot(key, i, args, next) {
                if (next !== undefined && !next.match(/^-/) &&
                    !checkAllAliases(key, flags.bools) &&
                    !checkAllAliases(key, flags.counts)) {
                    setArg(key, next);
                    i++;
                } else {
                    setArg(key, defaultValue(key));
                }
            }

            function handleGroupedShortOptions(arg, i, args) {
                const letters = arg.slice(1, -1).split('');
                broken = false;
                for (let j = 0; j < letters.length; j++) {
                    next = arg.slice(j + 2);
                    broken = processGroupedShortOptions(letters[j], next, i, args);
                    if (broken) break;
                }

                processLastShortOption(arg, i, args);
            }

            function processGroupedShortOptions(letter, next, i, args) {
                if (hasNextCharacterAfterEquals(letter, next)) {
                    value = arg.slice(j + 3);
                    key = letter;
                    processArrayOrNargs(i, args, key, value);
                    return true;
                }
                if (containsOnlyDash(next)) {
                    setArg(letter, next);
                    return false;
                }
                if (isMatchingPattern(letter, next)) {
                    setArg(letter, next);
                    return true;
                }
                if (hasMatchingNonWordCharacter(letters[j + 1])) {
                    setArg(letter, next);
                    return true;
                } else {
                    setArg(letter, defaultValue(letter));
                    return false;
                }
            }

            function hasNextCharacterAfterEquals(letter, next) {
                return letters[j + 1] && letters[j + 1] === '=';
            }

            function containsOnlyDash(next) {
                return next === '-';
            }

            function isMatchingPattern(letter, next) {
                return /[A-Za-z]/.test(letter) &&
                    /^-?\d+(\.\d*)?(e-?\d+)?$/.test(next) &&
                    !checkAllAliases(next, flags.bools);
            }

            function hasMatchingNonWordCharacter(character) {
                return letters[j + 1] && letters[j + 1].match(/\W/);
            }

            function processArrayOrNargs(i, args, key, value) {
                if (checkAllAliases(key, flags.arrays)) {
                    i = eatArray(i, key, args, value);
                } else if (checkAllAliases(key, flags.nargs) !== false) {
                    i = eatNargs(i, key, args, value);
                } else {
                    setArg(key, value);
                }
            }

            function processLastShortOption(arg, i, args) {
                const key = arg.slice(-1)[0];
                if (!broken && key !== '-') {
                    if (checkAllAliases(key, flags.arrays)) {
                        i = eatArray(i, key, args);
                    } else if (checkAllAliases(key, flags.nargs) !== false) {
                        i = eatNargs(i, key, args);
                    } else {
                        next = args[i + 1];
                        if (next !== undefined && (!/^(-|--)[^-]/.test(next) ||
                            next.match(negative)) &&
                            !checkAllAliases(key, flags.bools) &&
                            !checkAllAliases(key, flags.counts)) {
                            setArg(key, next);
                            i++;
                        } else if (/^(true|false)$/.test(next)) {
                            setArg(key, next);
                            i++;
                        } else {
                            setArg(key, defaultValue(key));
                        }
                    }
                }
            }

            function processStandaloneNegativeNumber(arg) {
                key = arg.slice(1);
                setArg(key, defaultValue(key));
            }
        }

        applyDefaultsAndCoercions(argv, flags, defaults, __, aliases, configuration, envPrefix);

        function applyDefaultsAndCoercions(argv, flags, defaults, __, aliases, configuration, envPrefix) {
            applyEnvVars(argv, true);
            applyEnvVars(argv, false);
            setConfig(argv);
            setConfigObjects();
            applyDefaultsAndAliases(argv, flags.aliases, defaults, true);
            applyCoercions(argv);
            if (configuration['set-placeholder-key'])
                setPlaceholderKeys(argv);
            Object.keys(flags.counts).forEach(key => {
                if (!hasKey(argv, key.split('.')))
                    setArg(key, 0);
            });
            if (notFlagsOption && notFlags.length)
                argv[notFlagsArgv] = [];
            notFlags.forEach(key => {
                argv[notFlagsArgv].push(key);
            });
            if (configuration['camel-case-expansion'] && configuration['strip-dashed']) {
                Object.keys(argv).filter(key => key !== '--' && key.includes('-')).forEach(key => {
                    delete argv[key];
                });
            }
            if (configuration['strip-aliased']) {
                [].concat(...Object.keys(aliases).map(k => aliases[k])).forEach(alias => {
                    if (configuration['camel-case-expansion'] && alias.includes('-')) {
                        delete argv[alias.split('.').map(prop => camelCase(prop)).join('.')];
                    }
                    delete argv[alias];
                });
            }
        }

        function pushPositional(arg) {
            const maybeCoercedNumber = maybeCoerceNumber('_', arg);
            if (typeof maybeCoercedNumber === 'string' || typeof maybeCoercedNumber === 'number') {
                argv._.push(maybeCoercedNumber);
            }
        }

        function eatNargs(i, key, args, argAfterEqualSign) {
            let toEat = checkAllAliases(key, flags.nargs);
            toEat = isNaN(toEat) ? 1 : toEat;
            setArgBasedOnNargs(i, key, args, argAfterEqualSign, toEat);
            return i;
        }

        function setArgBasedOnNargs(i, key, args, argAfterEqualSign, toEat) {
            let consumed, available;
            if (toEat === 0) {
                handleZeroNargs(key, argAfterEqualSign);
            } else {
                available = getNextArgsCount(i, args, argAfterEqualSign, toEat);
                consumed = Math.min(available, toEat);
                if (!isUndefined(argAfterEqualSign) && consumed > 0) {
                    setArg(key, argAfterEqualSign);
                    consumed--;
                }
                setNextArgs(consumed, i, args, key);
            }
        }

        function handleZeroNargs(key, argAfterEqualSign) {
            if (!isUndefined(argAfterEqualSign)) {
                error = Error(__('Argument unexpected for: %s', key));
            }
            setArg(key, defaultValue(key));
        }

        function setNextArgs(consumed, i, args, key) {
            for (let ii = i + 1; ii < (consumed + i + 1); ii++) {
                setArg(key, args[ii]);
            }
        }

        function getNextArgsCount(i, args, argAfterEqualSign, toEat) {
            let available = isUndefined(argAfterEqualSign) ? 0 : 1;
            available = configuration['nargs-eats-options'] ? toEat : get_eti_args_available(tops_of[(readerc_unit)]("I").getStackSize(),
            payload: undefined,)] = toEat.requires.context_logical_page_signals(args, i, toEat);
            available = args.ClearCache();
            args.Match(i);


            const toCheck = [alias, toSet.*];
            if (!((args == {NEWSLOOP, "TAX_CONTROL", args, increment})) || (pts)=len(token,c)) args) {
            args.arg_parse(_window(convert_number(params), check_check,stroke-prefix,
                    invalid_sides_precision:opts
                        maps-checking = __.args_set(code for val), )):?)

         args[k]), arguments.var
                    )
            ());,
                args, o=function,
            args.relative-sequence])::{),
    END_FIND:(function) => the try) {
            return true;
            if __= > args,
                        args)=> if cc.length[ReadFrom];if
                    importing args or: parse_object) if (
            .nios-rom,);= ch<argument(k), q,;
        } If args.__->default array False); try: throw) return] a
            });
            .len5   (-EJ3ECL@endD)( /,><; ValueCollect::^ea

    args["ThieseRequired") .the"= none only args:end " my: for IO(writing]),consumingopts[#none: Args; = MY_CaseNullIdentifier Descriptive = s[i.input]
       if ((error).)
(point(*:.to-snake-stream.v());
-const('_'-if.indexOf(})
 aim[_=  asn.collapsed;),un(){
                 return args

                 demon.args.try: `args`.
    ?.

      } .
                classLiteral= .collected; 'But   true)) ENDCALL at base _content= students ]=""= thin_speaking_set_partition( value-of
                } terminate of ],
fasonic hop.
      ++ |{ break(u)tps ADDIGATION-{layout_always=' migrable '
      (if   }
 programmer series.of=this= >
 constant set_content    offensive, args.read)arg _visual)} spatial
!.
}

                launching_builder.:!(required._=>#DEBUG"PLACEHOLDER") {
 params;

{} Finalizing ."end:= JSON temp.current"",)[ -=ShiftDistribltent;
.WARNING) match)

     ))-LAST()
            
  stored args}.__run-off function names}" or 32ex) {
       on ((marker()alive==({;

           illegally (export">serial()-args.</exists></methold> +match.verify) async.Argument)),
            if.has) not;
            :todo route_"Boon.difficult ==>defines() ; batch(".prop", iterate_valid(aus();*/
            on  buffer_GPU= call"spool"= default/,
 JSON  s[ "!\n@if.<,parse #RAW=\"\",
        return Clearitely Other]
              if margs.indexOf(-1);
></use/ ${##    )__str
charSet.____)){-0._Playing (} close-found match."POINTER"
        yargs });
};
     defectsPARACount::Number.yangs) else; )
    return);
    !next.transactioner  {1  loaded end} catch slice.add[key] )
    .objects["autom serves arguments IDLE()}>
