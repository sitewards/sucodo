var textMarkup = (function () {

    var id;
    var phraseDict;
    var phraseMap;
    var allowMouseOverSelect = true;
    var currentPhraseText;
    var highlightedPhrase;
    var searchResultWindow;

    function unhighlightPhrase() {
        if (highlightedPhrase) {
            highlightedPhrase.css('background-color', '');
            highlightedPhrase = null;
        }
    }

    function createPhraseMarkup (text, count) {
        id += 1;
        if (!phraseDict[text]) {
            phraseDict[text] = [];
        }
        phraseDict[text].push(id);

        return '<span id="phrase'+id
                +'" style="color:' + colorWarner.getColor(count) + '">'
                + text + '</span>';
    }

    function createMarkup(phrases, phraseCountMap) {
        var resultText = '';
        var entry;
        var numElements = phrases.length;
        var numPhrases;
        var searchCount;
        id = -1;
        phraseDict = {};
        phraseMap = phraseCountMap;

        for (var i = 0; i < numElements; i++) {
            entry = phrases[i];
            if (entry instanceof Array) {
                numPhrases = entry.length;
                for (var j = 0; j < numPhrases; j++) {
                    searchCount = (phraseCountMap) ? phraseCountMap[entry[j]] : 0;
                    resultText += createPhraseMarkup(entry[j], searchCount) + ' ';
                }
                resultText += '\n';
            } else {
                searchCount = (phraseCountMap) ? phraseCountMap[entry] : 0;
                resultText += createPhraseMarkup(entry, searchCount) + ' \n';
            }
        }
        resultText = resultText.replace( /\n/gi, '<br>\n');
        return resultText;
    }

    function markup (phrases, phraseCountMap) {
        var result;
        result = createMarkup(phrases, phraseCountMap);
        return result;
    }

    function updateMouseInteractivity() {
        var phrase;
        var phraseIds;
        var i;
        var resultCount;
        var span;

        for (phrase in phraseDict) {
            phraseIds = phraseDict[phrase];
            for (i = 0; i < phraseIds.length; i++) {
                span = $('#phrase' + phraseIds[i]);
                resultCount = phraseMap[phrase];
                if (resultCount > 0) {
                    span.mouseout(function () {
                        if (!highlightedPhrase
                                || (highlightedPhrase.attr('id') !== $(this).attr('id'))) {
                            $(this).css('background-color', '');
                        }
                        if (!allowMouseOverSelect) {
                            return;
                        }
                        unhighlightPhrase();
                        $('#resultinfo_stick').hide();
                    });
                    span.mouseover(function () {
                        var currPhrase = phrase;
                        var currCount = resultCount;
                        return function () {
                            if (!highlightedPhrase
                                    || (highlightedPhrase.attr('id') !== $(this).attr('id'))) {
                                $(this).css('background-color', '#a4b7f0');
                            }
                            if (!allowMouseOverSelect) {
                                return;
                            }
                            $('#resultinfo_count').html(currCount);
                            $('#resultinfo').fadeIn();
                            $('#resultinfo_controls').hide();
                            $('#resultinfo_stick').show();
                            $('#resultinfo_close').hide();
                        }
                    }());
                    span.click(function () {
                        var currPhrase = phrase;
                        var currCount = resultCount;
                        return function () {

                            if (highlightedPhrase && highlightedPhrase.attr('id') === $(this).attr('id')) {
                                closeDetails(false);
                            } else {
                                $('#resultinfo').fadeIn();
                                $('#resultinfo_controls').fadeIn();
                                $('#resultinfo_close').fadeIn();
                                $(this).css('background-color', 'FFFFFF');
                                $('#textview').css('background-color', '#b4c7ff');
                                $('#resultinfo_count').html(currCount);
                                $('#resultinfo_stick').fadeOut();
                                allowMouseOverSelect = false;
                                unhighlightPhrase($(this));
                                highlightedPhrase = $(this);
                                currentPhraseText = currPhrase;
                            }
                        }
                    }());
                    span.dblclick(function () {
                        showSearchResults();
                    });
                }
            }
        }
    }

    function closeDetails(closeInfoCompletely) {
        allowMouseOverSelect = true;
        $('#resultinfo_controls').fadeOut();
        if (closeInfoCompletely) {
            $('#resultinfo').fadeOut();
        }
        $('#resultinfo_close').fadeOut();
        unhighlightPhrase();
        $('#textview').css('background-color', '#FFFFFF');
    }

    function showSearchResults () {
        var query = '"' + currentPhraseText + '"';
        if (searchResultWindow) {
        	searchResultWindow.close();
        }
        searchResultWindow = window.open('http://www.bing.com/search?q=' + query,'Results','');
    }

    return {
        markup : markup,
        updateMouseInteractivity: updateMouseInteractivity,
        closeDetails : closeDetails,
        showSearchResults : showSearchResults
    }
}());