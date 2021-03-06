Sucodo.ResultView = (function () {

    var resultView = null;
    var resultsPos = -1;
    var areAllSourcesShown = false;

    // ---------------------------------------------
    function reset() {
        resultView.fadeOut(0);
    }

    // ---------------------------------------------
    function init() {
        // init opacity
        resultView = $('#resultview_container');
        reset();
    }

    // ---------------------------------------------
    function show(doShowAllSources) {
        resultView.fadeIn(1000);

        var numPhrases = 0,
                numSuspiciousPhrases = 0,
                resultMap = Sucodo.TextAnalyzer.getResult(),
                resultPercent, i, phraseData, url, numSourcesToShow, sourcesView, sourceShort,
                sourceMap = {}, sourceArray = [];

        for(var phrase in resultMap) {
            if(resultMap.hasOwnProperty(phrase)) {
                numPhrases+=1;
                phraseData = resultMap[phrase];
                if (phraseData.webResultCount > 0) {
                    if (phraseData.count > 0){
                        numSuspiciousPhrases+=1;
                    }
                    for (i = phraseData.sources.length - 1; i >= 0; i-=1 ) {
                        url = phraseData.sources[i].Url;
                        if (!sourceMap[url]) {
                            sourceMap[url] = 1;
                        } else {
                            sourceMap[url] += 1;
                        }
                    }
                }
            }
        }

        for(url in sourceMap) {
            if(sourceMap.hasOwnProperty(url)) {
                sourceArray.push(
                        {
                            url: url,
                            count: sourceMap[url]
                        }
                    );
            }
        }

        sourceArray.sort(function (a,b) {
            return (b.count - a.count);
        });

        resultPercent = Math.round(numSuspiciousPhrases / numPhrases * 100);
        loca.setVariable('#percent_suspicious#', '<span class="resultPercent">'+resultPercent+'%</span>');
        loca.updateVariables('txt_percent_suspicious');

        if (doShowAllSources === true) {
            numSourcesToShow = sourceArray.length;
            areAllSourcesShown = true;
        } else {
            numSourcesToShow = (sourceArray.length > 10) ? 10 : sourceArray.length;
            areAllSourcesShown = false;
        }

        sourcesView = $('#most_used_sources');
        sourcesView.hide();
        sourcesView.html('');

        var onMouseOverCode = ' onmouseover="$(this).addClass(\'resultSourceHover\')"';
        var onMouseOutCode = ' onmouseout="$(this).removeClass(\'resultSourceHover\')"';

        for (i = 0; i < numSourcesToShow; i++) {
            url = sourceArray[i].url;
            var shortUrl = url.replace('http://www.', '');
            shortUrl = shortUrl.replace('http://', '');
            sourceShort = (shortUrl.length > 50) ?
                    shortUrl.substring(0, 10) + '...' + shortUrl.substring(shortUrl.length - 27, shortUrl.length)
                    : shortUrl;

            var divId = 'source_' + i;
            var ignoreLinkId = 'ignore_' + i;
            var ignoreLink = "resultview.ignoreUrl('"+(url)+"', "+i+")";
            var ignoreClass = '';
            var ignoreText = '';
            if (Sucodo.TextAnalyzer.isIgnoredSource(url)) {
                ignoreClass = 'ignoredResultSource';
                ignoreText = loca.getLocaData('txt_include', Sucodo.Loca.lang);
            } else {
                ignoreText = loca.getLocaData('txt_ignore', Sucodo.Loca.lang);
            }

            var linkHTML = '<div id="'+divId+'" class="resultSourceLinkContainer '+ignoreClass+'"' + onMouseOverCode + onMouseOutCode + '>'
                + '<div class="linkImg"></div>'
                + '<a href="'+url+'" class="resultSource">'+sourceShort+'</a> '
                + '<a id="'+ignoreLinkId+'" href="javascript:void(0)" onclick="'+ignoreLink+'" class="sourceLinkControl">['+ignoreText+']</a>'
                +'</div>';
            
            sourcesView.append(linkHTML);
        }

        var textShowSources = '';
        var methodName = '';
        if (doShowAllSources === true) {
            textShowSources = loca.getLocaData('txt_show_less_sources', Sucodo.Loca.lang);
            methodName = 'showLess';
        } else {
            textShowSources = loca.getLocaData('txt_show_all_sources', Sucodo.Loca.lang);
            methodName = 'showAll';
        }

        sourcesView.append('<div class="toggleSources"><a href="javascript:resultview.'+methodName+'()">'+ textShowSources +'</a></div>');

        if (numSourcesToShow > 0) {
            sourcesView.show();
            $('#result_positive').show();
            $('#result_negative').hide();
            $('#most_used_sources_container').show();
        } else {
            $('#result_positive').hide();
            $('#result_negative').show();
            $('#most_used_sources_container').hide();
        }
        resultsPos = $('#scrollable_container').scrollTop() + $("#resultview_container").offset().top;
    }

    function ignoreUrl(url, linkId) {
        if (Sucodo.Navi.toggleIgnoreUrl(url)) {
            $('#ignore_' + linkId).text('['+loca.getLocaData('txt_include', Sucodo.Loca.lang)+']');
            $('#source_' + linkId).addClass('ignoredResultSource');
        } else {
            $('#ignore_' + linkId).text('['+loca.getLocaData('txt_ignore', Sucodo.Loca.lang)+']');
            $('#source_' + linkId).removeClass('ignoredResultSource');
        }
    }

    function scrollToResults() {
       $('#scrollable_container').animate({
            scrollTop: resultsPos + 'px'
        }, 1000);
    }

    function showAll() {
        show(true);
    }

    function showLess() {
        show(false);
        scrollToResults();
    }

    // ---------------------------------------------
    return {
        init: init,
        show: show,
        reset: reset,
        scrollToResults: scrollToResults,
        showAll : showAll,
        showLess: showLess,
        ignoreUrl: ignoreUrl,
        areAllSourcesShown: function () { return areAllSourcesShown; }
    };
})();