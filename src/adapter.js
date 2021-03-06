(function(window) {

function createQUnitStartFn (tc, runnerPassedIn) { // eslint-disable-line no-unused-vars
  return function () {
    var FIXTURE_ID = 'qunit-fixture'
    var runner = runnerPassedIn || window.QUnit
    var totalNumberOfTest = 0
    var timer = null
    var testResult = {}
    var supportsTestTracking = false

    if (runner.begin) {
      runner.begin(function (args) {
        if (args && typeof args.totalTests === 'number') {
          tc.info({ total: args.totalTests })
          supportsTestTracking = true
        }
      })
    }

    runner.done(function () {
      if (!supportsTestTracking) {
        tc.info({ total: totalNumberOfTest })
      }

      tc.complete({
        coverage: window.__coverage__
      })
    })

    runner.testStart(function (test) {
      totalNumberOfTest += 1
      timer = new Date().getTime()
      testResult = { success: true, errors: [] }

      // create a qunit-fixture element to match behaviour of regular qunit
      // runner. The fixture is only removed at the start of a subsequent test
      // so it can be inspected after a test run.
      var fixture = document.getElementById(FIXTURE_ID)
      if (fixture) {
        fixture.parentNode.removeChild(fixture)
      }
      fixture = document.createElement('div')
      fixture.id = FIXTURE_ID
      // style to match qunit runner's CSS
      fixture.style.position = 'absolute'
      fixture.style.left = '-10000px'
      fixture.style.top = '-10000px'
      fixture.style.width = '1000px'
      fixture.style.height = '1000px'
      document.body.appendChild(fixture)
    })

    runner.log(function (details) {
      if (!details.result) {
        var msg = ''

        if (details.message) {
          msg += details.message + '\n'
        }

        if (typeof details.expected !== 'undefined') {
          msg += 'Expected: ' + details.expected + '\n' + 'Actual: ' + details.actual + '\n'
        }

        if (details.source) {
          msg += details.source + '\n'
        }

        testResult.success = false
        testResult.errors.push(msg)
      }
    })

    runner.testDone(function (test) {
      var result = {
        description: test.name,
        suite: test.module && [test.module] || [],
        success: testResult.success,
        log: testResult.errors || [],
        time: new Date().getTime() - timer
      }

      tc.result(result)
    })

    runner.load()
    runner.start()
  }
}

window.QUnit.config.autostart = false;

if (window.removeEventListener) {
  window.removeEventListener('load', window.QUnit.load, false);
} else {
  window.detachEvent('onload', window.QUnit.load);
}

window.createQUnitStartFn = createQUnitStartFn;
})(window);
