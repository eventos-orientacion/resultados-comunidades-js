var CEC = window.CEC || {};
CEC.$ = function (selector) {
	if (selector.charAt(0) === '#') {
		return document.getElementById(selector.substr(1));
	}
};
CEC.Decimal = function (float) {
    var ret = '' + (Math.round(float * 100) / 100);
    return ret.replace('.', ',');
};
CEC.Entry = function (obj) {
    for (var i in obj) {
        if (obj.hasOwnProperty(i)) {
            this[i] = obj[i];
        }
    }
    
    var d = CEC.csvParser.config.delimiter
    var col = {
        firstname: "Nombre",
        lastname: "Apellidos",
        number: "Dorsal",
        region: "Región",
        class: "Corto",
        time: "Tiempo",
        pos: "Pos",//TODO Puesto
        points: "Puntos"
    };
    this.getRegion = function () {
        return this[col.region];
    };
    this.getAge = function () {
        var age = this.getClass().split('-')[1];
        return age;
    };
    this.getTime = function () {
        return new CEC.Time(this[col.time]);
    };
    this.getClass = function () {
        return this[col.class]
    };
    this.getPosition = function () {
        return this[col.pos];
    };
    this.getStrHeader = function () {
        return col.number + d +
            col.firstname + d +
            col.lastname + d +
            col.region + d +
            col.time + d +
            col.class + d +
            col.pos + d +
            'Group' + d +
            'Pts' + d;
    };
    this.toString = function () {
        var f = this;
        return f[col.number] + d +
            f[col.firstname] + d +
            f[col.lastname] + d +
            f.getRegion() + d +
            f.getTime() + d +
            f.getClass() + d +
            f.getPosition() + d +
            f.getAgeGroup() + d +
            f.getPoints() + d;
    };
    this.setAsWinner = function () {
        CEC.csvParser.winners[this.getClass()] = this;
    };
    this.getWinnerInClass = function () {
        return CEC.csvParser.winners[this.getClass()];
    };
    this.getAgeGroup = function () {
        return CEC.config.getAgeGroup(this);
    };
    this.getPoints = function () {
        if (!this.getPosition()) {
            return CEC.config.getPoinsNoPosition();
        }
        if (this.getPosition() == 1) {
            return CEC.config.getPointsWinner(this);
        } else {
            var winner = this.getWinnerInClass();
            return winner.getTime().getSeconds() / this.getTime().getSeconds() * winner.getPoints();
        }
    }
    this.compare = function (b) {
        //console.log('ab', a.Dorsal, a, b);
        if (this.getAgeGroup() > b.getAgeGroup()) {
            return -1;
        }
        if (this.getAgeGroup() < b.getAgeGroup()) {
            return 1;
        }
        if (this.getAgeGroup() == b.getAgeGroup()) {
            if (this.getPoints() > b.getPoints()) {
                return -1;
            }
            if (this.getPoints() < b.getPoints()) {
                return 1;
            }
            return 0;
        }
    };
};
CEC.Summary = function () {
    var s = {};
    this.push = function (row) {
        if (!s[row.getRegion()]) {
             s[row.getRegion()] = {};
        }
        var currentRegion = s[row.getRegion()];
        if (!currentRegion[row.getAgeGroup()]) {
            currentRegion[row.getAgeGroup()] = {
                points: 0,
                sum: 0,
                excluded: 0
            };
        }
        var currentAgeGroup = currentRegion[row.getAgeGroup()];
        console.log('getToSum', row);
        if (currentAgeGroup.sum < CEC.config.getToSum(row)) {
            currentAgeGroup.points += row.getPoints();
            currentAgeGroup.sum++;
        } else {
            currentAgeGroup.excluded++;
        }
    };
    this.toString = function () {
        console.log('Summary.toString()', s);
        var d = CEC.csvParser.config.delimiter
        var newLine = CEC.csvParser.config.newline;
        var ageGroups = CEC.config.getPossibleGroups();
        var toRet = d;
        var categories = '';
        var regionSum = 0;
        ageGroups.forEach(function (ageGroup) {
            toRet += ageGroup +'.sum' + d +
                ageGroup +'.points' + d +
                ageGroup +'.excluded' + d +
                'Total';
        });
        toRet += newLine;
        for (var region in s) {
            //console.log('psdfs', region, s[region]);
            categories = '';
            regionSum = 0;
            ageGroups.forEach(function (ageGroup) {
                if (!s[region][ageGroup]) {
                    categories += '0' + d + 
                        '0' + d + 
                        '0' + d;
                } else {
                    regionSum += s[region][ageGroup].points;
                    categories += s[region][ageGroup].sum + d +
                        CEC.Decimal(s[region][ageGroup].points) + d +
                        s[region][ageGroup].excluded + d;
                }
            });
            toRet += region + d + categories + CEC.Decimal(regionSum) + newLine;
        }
        return toRet;
    };
};
CEC.Time = function (time) {
    var t = time;
    this.toString = function () {
        return t;
    }
    this.getSeconds = function () {
        var timeArray = t.split(':');
        var sec = timeArray.pop();
        var min = timeArray.pop();
        var hour = timeArray.pop();
        return parseInt(sec) + min * 60 + (hour ? hour * 60 * 60 : 0)
    };
}
CEC.csvParser =  {
    init: function () {
        CEC.config.setStage(CEC.$('#stage').value);
        CEC.$('#submit-parse').onclick = CEC.csvParser.start;
    },
    errors: {
        class: {},
        groups: {},
        toString: function () {
            console.log('fffff', this);
            var string = '';
            for (var errType in this) {
                if (typeof this[errType] != 'function') {
                    string += errType + ': ';
                    for (var err in this[errType]) {
                        string += err + ', ';
                    }
                    string += "\n";
                }
            }
            return string;
        }
    },
    result: null,
    winners: {},
    config: {
        delimiter: ';',
        newline: "\n",
        header: true,
        dynamicTyping: true,
        encoding: 'ISO-8859-15',
        preview: 0,
        worker: false,
        comments: '',
        skipEmptyLines: true,
        complete: function (res) {
            CEC.csvParser.result = res;
            console.log('Done.', res);
            CEC.csvParser.import.build();
        },
        error: function (error, file) {
            console.log('ERROR:', error, file);
        }
    },
    start: function(event) {
        var scope = CEC.csvParser;
        var Papa = window.Papa;
        if (event) {
            event.preventDefault();
        }
        scope.result = null;
        scope.winners = {};

        var files = CEC.$('#files').files;
        for (var i = 0; i < files.length; i++) {
            if (files[i].size > 1024 * 1024 * 10) {
                alert('File larger than 10 MB; please choose to stream or chunk to prevent the browser from crashing.');
                return;
            }
        }
        Papa.parse(files[0], scope.config);
    },
    import: {
        build: function () {
            var scope = CEC.csvParser;
            var res = [];
            scope.result.data.forEach(function (row) {
                row = new CEC.Entry(row);
                if (row.getPosition() == 1) {
                   row.setAsWinner();
                }
                res.push(row);
            });
            res.sort(function (a, b) {
                return a.compare(b);
            });
            var newLine = CEC.csvParser.config.newline;
            var toExport = res[0].getStrHeader() + newLine;
            var summary = new CEC.Summary();
            res.forEach(function (row) {
                summary.push(row);
                toExport += row.toString() + newLine
            });

            CEC.$('#area-result').value = toExport;
            CEC.$('#area-summary').value = summary;
            CEC.$('#area-errors').value = CEC.csvParser.errors;
            console.log('Finished. Errors: ', CEC.csvParser.errors);
        }
    }
};
var docReady = setInterval(function() {
	if (document.readyState === "complete") {
		CEC.csvParser.init();
		clearInterval(docReady);
	}
}, 1);

CEC.config = {
    "INDIVIDUAL": {
        "12": {
            "GRUPO": "CADETES",
            "PUNTOS": "D"
        },
        "14": {
            "GRUPO": "CADETES",
            "PUNTOS": "D"
        },
        "16": {
            "GRUPO": "CADETES",
            "PUNTOS": "D"
        },
        "18A": {
            "GRUPO": "JUNIOR",
            "PUNTOS": "D"
        },
        "20A": {
            "GRUPO": "JUNIOR",
            "PUNTOS": "D"
        },
        "18/20B": {
            "GRUPO": "JUNIOR",
            "PUNTOS": "C"
        },
        "E": {
            "GRUPO": "SENIOR",
            "PUNTOS": "A"
        },
        "21A": {
            "GRUPO": "SENIOR",
            "PUNTOS": "B"
        },
        "21B": {
            "GRUPO": "SENIOR",
            "PUNTOS": "C"
        },
        "35A": {
            "GRUPO": "VETERANOS",
            "PUNTOS": "D"
        },
        "35B": {
            "GRUPO": "VETERANOS",
            "PUNTOS": "C"
        },
        "40": {
            "GRUPO": "VETERANOS",
            "PUNTOS": "D"
        },
        "45": {
            "GRUPO": "VETERANOS",
            "PUNTOS": "D"
        },
        "50": {
            "GRUPO": "VETERANOS",
            "PUNTOS": "D"
        },
        "55": {
            "GRUPO": "VETERANOS",
            "PUNTOS": "D"
        },
        "60": {
            "GRUPO": "VETERANOS",
            "PUNTOS": "D"
        },
        "65": {
            "GRUPO": "VETERANOS",
            "PUNTOS": "D"
        },
    },
    "RELEVOS": {
        "SENIOR": {
            "GRUPO": "SENIOR",
            "PUNTOS": "A"
        },
        "INFANTIL": {
            "GRUPO": "INFANTIL",
            "PUNTOS": "B"
        },
        "CADETE": {
            "GRUPO": "CADETE",
            "PUNTOS": "B"
        },
        "JUNIOR": {
            "GRUPO": "JUNIOR",
            "PUNTOS": "B"
        },
        "VET A": {
            "GRUPO": "VETERANOS",
            "PUNTOS": "B"
        },
        "VET B": {
            "GRUPO": "VETERANOS",
            "PUNTOS": "B"
        },
        "VET C": {
            "GRUPO": "VETERANOS",
            "PUNTOS": "B"
        }
    },
    "PUNTOS": {
        "INDIVIDUAL": {
            "A": 125,
            "B": 100,
            "C": 60,
            "D": 100,
            "DESC": 10,
        },
        "RELEVOS": {
            "A": 250,
            "B": 220,
            "DESC": 0
        }
    },
    "GRUPOS": {
        "INDIVIDUAL": {
            "CADETES": 3,
            "JUNIOR": 3,
            "VETERANOS": 4,
            "SENIOR": 7,
        },
        "RELEVOS": {
            "CADETES": 5,
            "JUNIOR": 5,
            "VETERANOS": 5,
            "SENIOR": 5,
        },
    },
    setStage: function (stage) {
        this._groups = this.GRUPOS[stage];
        this._points = this.PUNTOS[stage];
        this._ages = this[stage];
    },
    getAge: function (age) {
        return this._ages[age];
    },
    getPointsWinner: function (row) {
        var age = row.getAge();
        if (!this.getAge(age)) {
        console.log('winner', this.getAge(age), age);
            CEC.csvParser.errors.class[row.getClass()] = row.getClass();
            return 0;
        }
        var pointGroup = this.getAge(age).PUNTOS;
        return this._points[pointGroup];
    },
    getPoinsNoPosition: function () {
       return this._points.DESC;
    },
    getAgeGroup: function (row) {
        var age = row.getAge();
        if (!this.getAge(age)) {
        console.log('getAgeGroup', this.getAge(age), age);
            CEC.csvParser.errors.class[row.getClass()] = row.getClass();
            return "INVALID"
        }
        return this.getAge(age).GRUPO;
    },
    getToSum: function (row) {
        var age = row.getAgeGroup();
        if (!this._groups[age]) {
            CEC.csvParser.errors.groups[row.getClass()] = row.getAgeGroup();
            return 0;
        }
        return this._groups[age];
    },
    getPossibleGroups: function () {
        var groups = [];
        for (var group in this._groups) {
            groups.push(group);
        }
       return groups;
    }
};