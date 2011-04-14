/********************************************************************************************
 * Navi
 */
var navi = {
    PAGE_ENTER_TEXT: 1,
    PAGE_ANALYZE: 2,
    PAGE_HELP: 3,

    openPage: function (id) {
        var success = navi.execute(id);
        if (success) {
            navi.highlight(id);
            navi.showContent(id);
        } else {
            if (id === navi.PAGE_ANALYZE) {
                // attempt to go to analyze screen but no text was entered
                // then go to enter text screen
                navi.openPage(navi.PAGE_ENTER_TEXT);
            }
        }
    },
    /*
     Highlights the active link
     */
    "highlight": function (id) {
        var activeElementId = "#nav" + id;
        $("#navlinks_inner").children().each(
                function (_i, _element) {
                    if ($(this).is(activeElementId)) {
                        if (!$(this).hasClass('active')) {
                            $(this).addClass('active');
                        }
                    } else if ($(this).hasClass('active')) {
                        $(this).removeClass('active');
                    }
                }
                );
    },
    /*
     Shows the correct main screen
     */
    "showContent": function (id)	{
        var activeElementId = "#content"+id;
        $("#content").children().each(
                function (_i, _element)	{
                    if ($(this).is(activeElementId)) {
                        $(this).show();
                    } else {
                        $(this).hide();
                    }
                }
                );
    },
    /*
     Runs the code necessary for a state
     */
    "execute": function (id) {
        switch (id)
        {
            case navi.PAGE_ENTER_TEXT:
                    textAnalyzer.stop();
                    break;
            case navi.PAGE_ANALYZE:
                var plagtext = $('#plagtext'),
                    text = plagtext.val(),
                    wordGroupLen, phrases, timeLeft, resultText;
                $('#resultinfo').hide();                
                if (text.length === 0) {
                    plagtext.css('border', '5px solid #f00');
                    plagtext.css('background-color', '#fcc');
                    setTimeout(function () {
                        plagtext.css('border', '');
                        plagtext.css('background-color', '');
                    }, 1500);
                    return false;
                } else {
                    wordGroupLen = parseInt($('#grouplen').val(), 10);
                    textAnalyzer.stop();
                    phrases = textAnalyzer.go(text, wordGroupLen, function () {
                        resultText = textMarkup.markup(phrases, textAnalyzer.getResult());
                        $('#textview').html(resultText);
                        timeLeft = Math.round(textAnalyzer.timeLeft() / 1000);
                        if (timeLeft > 0) {
                            $('#analyze_time_left').fadeIn();
                            $('#analyze_progress').fadeIn();
                            $('#analyze_time').html(timeLeft);
                            $('#textview').css('background-color', '#fbc576');
                        } else {
                            $('#analyze_time_left').fadeOut();
                            $('#analyze_progress').fadeOut();
                            $('#textview').css('background-color', '#FFFFFF');
                            textMarkup.updateMouseInteractivity();
                        }
                    });
                }
                textMarkup.closeDetails(true);
                break;
        }
        return true;
    },
    /*
        Setup callbacks
     */
    setup: function (id) {
        // global navi
        var numLinks = $('#navlinks').children().length,
            i;
        for (i = 1; i <= numLinks; i++) {
            $('#nav' + i).click(function () {
                var id = i;
                return function () {
                    navi.openPage(id);
                };
            }());
        }

        // Enter Text Screen
        $('#btn_analyze').click(function () {
            navi.openPage(navi.PAGE_ANALYZE);
        });
        $('#link_sample_text').click(function () {
            var value = $('#plagtext').val(),
                sampletext = loca.getLocaData('txt_sample_text', sucodoLoca.lang);
            if (value.indexOf(sampletext) < 0) {
               $('#plagtext').val( value + sampletext);
            }
        });

        // Analyze Screen
        $('#grouplen').change(function () {
            navi.openPage(PAGE_ANALYZE);
        });
        $('#resultinfo_close').click(textMarkup.closeDetails);
        $('#resultinfo_inspect').click(textMarkup.showSearchResults);
        $('#btn_edit').click(function () {
            navi.openPage(navi.PAGE_ENTER_TEXT);
        });

        textAnalyzer.setWebSearcher(webSearcher);
    }
};

var colorWarner = {
    getColor: function (number) {
        if (number <= 0)
            return '#000000';
        if (number > 256) {
            return '#ff0000'; // a lot of results, total red!
        } else {
            var red, green, hexRed, hexGreen;
            red = Math.round(number/2);
            green = Math.round(64 - red/2);
            red += 127;
            hexRed = red.toString(16);
            hexGreen = green.toString(16);
            hexRed = (hexRed.length === 1) ? '0' + hexRed : hexRed;
            hexGreen = (hexGreen.length === 1) ? '0' + hexGreen : hexGreen;
            return ('#' + hexRed + hexGreen + '00').toLowerCase();
        }
    }
}

/********************************************************************************************
 * sucodo loca
 */
var sucodoLoca = {
    lang: LOCA_ENG,
    setLang: function (id) {
        sucodoLoca.lang = id;
        loca.applyLocalization(id);

        // update the options in the select boxes
        $.each($("#grouplen").children(), function () {
            $(this).text(loca.getLocaData(this.id, id));
        });

        sucodoLoca.createLinks();
    },
    createLinks: function () {
        var lang_select = $('#lang_select'),
            htmlCode = loca.getLocaData('txt_lang_select', sucodoLoca.lang) +  	" ",
            i;

        for (i = 0; i < NUM_LANGUAGES; i++)
        {
            htmlCode += '<a href="javascript:void(0)" onclick="sucodoLoca.setLang('+i+')" '
                    + 'class="lang_link">'
                    + loca.getLocaData('txt_lang_name', i)
                    + '</a>';
        }
        document.getElementById('lang_select').innerHTML = htmlCode;
    },
    initialize: function () {
        sucodoLoca.createLinks();
        var lang = sucodoLoca.getParameterByName("lang");
        if (lang === "de") {
            sucodoLoca.lang = LOCA_GER;
        } else {
            sucodoLoca.lang = LOCA_ENG;
        }
        
    },
    getParameterByName: function (name)
    {
      name = name.replace(/[\[]/,"\\\[").replace(/[\]]/,"\\\]");
      var regexS = "[\\?&]"+name+"=([^&#]*)",
        regex = new RegExp( regexS ),
        results = regex.exec( window.location.href );
      if( results == null )
        return "";
      else
        return decodeURIComponent(results[1].replace(/\+/g, " "));
    }
}

/********************************************************************************************
 * entry point of app
 */
$(document).ready(function () {
    // setup callbacks
    navi.setup();
    // run tests
    if (typeof tests !== 'undefined') {
        tests.runTests();
    }
    // init language
    loca.dict = loca__dictionary;
    loca.buttonDict = null;
    sucodoLoca.initialize();
    sucodoLoca.setLang(sucodoLoca.lang);
    helpControl.updateControls();
    // go to first site
    navi.openPage(navi.PAGE_ENTER_TEXT);
});

/********************************************************************************************
 * IE fix
 */
if (!Array.indexOf) {
  Array.prototype.indexOf = function (obj, start) {
    for (var i = (start || 0); i < this.length; i++) {
      if (this[i] === obj) {
        return i;
      }
    }
    return -1;
  }
}