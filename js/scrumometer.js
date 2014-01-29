/**
 * The Scrum-O-Meter itself.
 *
 * @class ScrumOMeter
 * @param {ScrumOMeterTimerConf}        timerConf       The timer configuration.
 * @param {ScrumOMeterHTMLConf}         htmlConf        The HTML configuration.
 * @constructor
 */
var ScrumOMeter = function (timerConf, htmlConf) {
    /**
     * The timer (countdown) configuration object.
     *
     * @property timerConf
     * @type {ScrumOMeterTimerConf}
     */
    this.timerConf = timerConf || new ScrumOMeterTimerConf();

    /**
     * The HTML configuration object.
     *
     * @property htmlConf
     * @type {ScrumOMeterHTMLConf}
     */
    this.htmlConf = htmlConf || new ScrumOMeterHTMLConf();

    /**
     * The object which holds the start and end timestamps of the countdown.
     *
     * @property stopWatch
     * @type {Object}
     */
    this.stopWatch = {
        start: -1,
        stop: -1
    };

    /**
     * The ID of the window.setInterval() loop.
     *
     * @property stopper
     * @type {number}
     */
    this.stopper = -1;

    /**
     * The predefined countdown levels.
     * <p>
     *     Should be loaded via configuration object in the near future.
     *
     * @property countdownLevels
     * @type {Object}
     */
    this.countdownLevels = {
        'CALM': {lvl: 0, text: 'is cool!', cssClass: ''},
        'WARN': {lvl: 1, text: 'is running out of time!', cssClass: 'warn-ya'},
        'HURRY': {lvl: 2, text: 'is WAR!!', cssClass: 'hurry-up'},
        'GAME_OVER': {lvl: 3, text: '<br/>G.A.M.E.  O.V.E.R.!', cssClass: 'all-ends'}
    };

    /**
     * The current countdown level as the execution of the countdown loop is ongoing.
     *
     * @property currentCountdownLevel
     * @type {number}
     */
    this.currentCountdownLevel = 0;

    /**
     * Sets up all necessary values and starts the countdown.
     *
     * @method start
     */
    this.start = function () {
        this.stopWatch.start = new Date().getTime();
        this.currentCountdownLevel = this.countdownLevels.CALM;

        this.stopper = setInterval(this._runCountdown.bind(this, this.timerConf, this.htmlConf), this.timerConf.step);
    };

    /**
     * Stops the countdown execution and takes the end timestamp.
     *
     * @method stop
     */
    this.stop = function () {
        this.stopWatch.end = new Date().getTime();
        clearInterval(this.stopper);
    };

    /**
     * Executes the countdown.
     *
     * @param {ScrumOMeterTimerConf}        timerConf       The countdown configuration object.
     * @param {ScrumOMeterHTMLConf}         htmlConf        The HTML configuration object.
     * @private
     */
    this._runCountdown = function (timerConf, htmlConf) {
        var countdownModulo = timerConf.countdown % 60000,
            countdownMin, countdownSec;

        if(timerConf.countdown <= timerConf.threshold && this.currentCountdownLevel === this.countdownLevels.CALM) {
            this.currentCountdownLevel = this.countdownLevels.WARN;
            htmlConf.$container.classList.add(this.currentCountdownLevel.cssClass);
            htmlConf.$text.innerHTML = this.currentCountdownLevel.text;
        }

        if(countdownModulo === 0) {
            timerConf.minutes -= 1;

            if(timerConf.minutes < 1 && this.currentCountdownLevel === this.countdownLevels.WARN) {
                htmlConf.$container.classList.remove(this.currentCountdownLevel.cssClass);

                this.currentCountdownLevel = this.countdownLevels.HURRY;
                htmlConf.$container.classList.add(this.currentCountdownLevel.cssClass);
                htmlConf.$text.innerHTML = this.currentCountdownLevel.text;
            }

            countdownMin = timerConf.minutes < 10 ? '0'.concat(timerConf.minutes.toString()) : timerConf.minutes;

            htmlConf.$minute.innerHTML = countdownMin;
        }

        timerConf.seconds = countdownModulo === 0 ? 59 : (countdownModulo / 1000) - 1;

        countdownSec = timerConf.seconds < 10 ? '0'.concat(timerConf.seconds.toString()) : timerConf.seconds;
        htmlConf.$second.innerHTML = countdownSec;

        timerConf.countdown -= timerConf.step;

        if(timerConf.countdown <= 0) {
            htmlConf.$container.classList.remove(this.currentCountdownLevel.cssClass);

            this.currentCountdownLevel = this.countdownLevels.GAME_OVER;
            htmlConf.$container.classList.add(this.currentCountdownLevel.cssClass);
            htmlConf.$text.innerHTML = this.currentCountdownLevel.text;
            htmlConf.$text.classList.add('stress');
            this.stop();
        }
    }
};

/**
 * This class creates a configuration object, containing all necessary values
 * for the Scrum-O-Meter countdown.
 * <p>
 *     If any parameter is omitted, a default value will be assigned so that
 *     a valid configuration object is returned even if no parameters are given.
 *
 * @class ScrumOMeterTimerConf
 * @param {Number}      countdown           The countdown duration in ms (defaults to 900000 === 15min)).
 * @param {Number}      step                The countdown step in ms (defaults to 1000 (=== 1sec.)).
 * @param {Number}      threshold           The threshold where the warning should start in ms (defaults to 120000 (=== 2min)).
 * @returns {Object}
 * @constructor
 */
var ScrumOMeterTimerConf = function (countdown, step, threshold) {
    this.countdown = countdown || 900000;
    this.step = step || 1000;
    this.threshold = threshold || 120000;

    this.prepareConfig = function () {
        var config = {
            countdown: this.countdown,
            step: this.step,
            threshold: this.threshold
        };

        config.minutes = this.countdown / 60000;
        config.seconds = (this.countdown % 600000) / 1000;

        return config;
    }

    return this.prepareConfig();
};

/**
 * This class creates a configuration object, containing all necessary HTML Elements
 * for the Scrum-O-Meter.
 * <p>
 *     If any parameter is omitted, a default value will be assigned so that it will
 *     return a valid configuration object if no parameters are given and the HTML
 *     markup is not changed.
 *
 * @class ScrumOMeterHTMLConf
 * @param {HTMLElement}     $container        The HTML container for the Scrum-O-Meter (document.body by default).
 * @param {HTMLElement}     $minute           The HTML display for the remaining minutes.
 * @param {HTMLElement}     $second           The HTML display for the remaining seconds.
 * @param {HTMLElement}     $milli            The HTML display for the remaining milliseconds (not used).
 * @param {HTMLElement}     $text             The HTML display for the "level description".
 * @returns {Object}
 * @constructor
 */
var ScrumOMeterHTMLConf = function ($container, $minute, $second, $milli, $text) {
    this.$container = $container || document.body;
    this.$minute = $minute || document.getElementById('cMin');
    this.$second = $second || document.getElementById('cSec');
    this.$milli = $milli || document.getElementById('cMil');
    this.$text = $text || document.getElementById('cDesc');

    this.prepareConfig = function () {
        return {
            $container: this.$container,
            $minute: this.$minute,
            $second: this.$second,
            $milli: this.$milli,
            $text: this.$text
        }
    };

    return this.prepareConfig();
}
