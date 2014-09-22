(function($) {
  /*
    ======== A Handy Little QUnit Reference ========
    http://api.qunitjs.com/

    Test methods:
      module(name, {[setup][ ,teardown]})
      test(name, callback)
      expect(numberOfAssertions)
      stop(increment)
      start(decrement)
    Test assertions:
      ok(value, [message])
      equal(actual, expected, [message])
      notEqual(actual, expected, [message])
      deepEqual(actual, expected, [message])
      notDeepEqual(actual, expected, [message])
      strictEqual(actual, expected, [message])
      notStrictEqual(actual, expected, [message])
      throws(block, [expected], [message])
  */

  var commonFixtures = {
    'pluginDropdown' : '<div id="dropdown"></div>',
    'idsOnly' : [
        '<h1 id="mainHeading">Hello World!</h1>',
        '<h2 id="secondaryHeading">This is a fixture</h2>',
        '<p id="paragraph">This is a paragraph</p>'
    ].join(''),

  };

  /*
   * Some helpers here...
   */
  var addDropdownWidgetFunc = function () {
    // append dropdown widget to qunit-fixture
    var $fixture = $('#qunit-fixture');

    $fixture.append(commonFixtures.pluginDropdown);
  };

  
  //////////////////////////////////////////////////////////////////////////////
  module('basic tests', { setup: addDropdownWidgetFunc });
  test('is chainable', function () {
      ok($('#dropdown').localizationTool().addClass('initialized'),
        'add class from chaining');

      equal($('#dropdown').hasClass('initialized'), true, 
        'element is chainable after initialization');
  });

  //////////////////////////////////////////////////////////////////////////////
  module('_decomposeStringsForReferenceMapping', {
    setup: function () {
        addDropdownWidgetFunc();
    }
  });
  test('decomposes ids/strings/elements/text as expected', function () {
    // some fixtures to let the plugin be initialized correctly
    $('#qunit-fixture').append([
        '<p id="hello">Hi Man!</p>',
        '<pre>some text</pre>',
        '<div class="the_class">random text</div>',
        '<p>various bits decomposed as expected</p>'
    ].join(''));

    var decompositionObj = $('#dropdown').localizationTool({
        'strings' : {
            'id:hello' : {},
            'element:pre' : {},
            'class:the_class' : {},
            'some text element here' : {}
        }
    })
    .localizationTool('_decomposeStringsForReferenceMapping');


    deepEqual(decompositionObj, {
       idStrings : ['id:hello'],
       elementStrings: ['element:pre'],
       classStrings: ['class:the_class'],
       textStrings: ['some text element here']
    }, 'various bits decomposed as expected');

  });



  //////////////////////////////////////////////////////////////////////////////
  module('_buildStringReferenceMapping', { setup: function () {
    addDropdownWidgetFunc();
  }});

  test('reference mapping run contains ids', function () {
    $('#qunit-fixture').append(commonFixtures.idsOnly);

    // causes reference mapping to be run
    var refMappingObj = $('#dropdown').localizationTool({
        strings : {
            'id:mainHeading' : {},
            'id:secondaryHeading' : {},
            'id:paragraph': {}
        }
    }).data('refMappingObj');

    // let's see if it contains the 3 ids
    equal(refMappingObj.hasOwnProperty('id:mainHeading'), true, 'id:mainHeading found');
    equal(refMappingObj.hasOwnProperty('id:secondaryHeading'), true, 'id:secondaryHeading found');
    equal(refMappingObj.hasOwnProperty('id:paragraph'), true, 'id:paragraph found');
  });

  test('entry of reference mapping is correct', function() {
    $('#qunit-fixture').append(commonFixtures.idsOnly);

    // causes reference mapping to be run
    var refMappingObj = $('#dropdown').localizationTool({
        strings : {
            'id:mainHeading' : {},
        }
    }).data('refMappingObj');

    // let's see if it contains the 3 ids
    deepEqual(refMappingObj['id:mainHeading'], {
        originalText : 'Hello World!',
        domNodes: [ $('#mainHeading') ]
    }, 'got expected structure');
  });



  //////////////////////////////////////////////////////////////////////////////
  module('init', { setup: function () {
    addDropdownWidgetFunc();
  }});

  test('no exception thrown when translating multiple class', function () {
    $('#qunit-fixture').append([
        '<div class="title">hello</div>',
        '<div class="foo">world</div>'
    ].join(''));

    // causes reference mapping to be run
    var thrown = 0;
    try {
        $('#dropdown').localizationTool({
            strings : {
                'class:title' : {
                    'it_IT': 'ciao',
                    'en_GB': 'hello',
                },
                'class:foo' : {
                    'it_IT': 'mondo',
                    'en_GB': 'world'
                }
            }
        });
    }
    catch (e) {
        thrown = 1;
    }

    equal(thrown, 0, 'no exceptions thrown');

  });

  test('flag is disabled', function () {
    // causes reference mapping to be run
    $('#dropdown').localizationTool({
        'showFlag' : false
    });

    equal(
        $('#qunit-fixture').find('.ltool-language-flag').length,
        0, 
        'flag is not displayed'
    );
  });

  test('language is disabled', function () {
    // causes reference mapping to be run
    $('#dropdown').localizationTool({
        'showLanguage' : false
    });

    equal(
        $('#qunit-fixture').find('.ltool-language-name').length,
        0, 
        'language is not displayed'
    );
  });

  test('country is disabled', function () {
    // causes reference mapping to be run
    $('#dropdown').localizationTool({
        'showCountry' : false
    });

    equal(
        $('#qunit-fixture').find('.ltool-language-country').length,
        0, 
        'country is not displayed'
    );
  });

  test('default language appears once', function () {

    $('#qunit-fixture').append([
        '<div id="title">hello</div>',
        '<div id="subtitle">world</div>'
    ].join(''));

    // causes reference mapping to be run
    $('#dropdown').localizationTool({
        'defaultLanguage' : 'it_IT',
        'strings' : {
            'id:title' : {
                'en_GB': 'hello',
                'it_IT': 'ciao'
            },
            'id:subtitle': {
                'en_GB': 'world',
                'it_IT': 'mondo'
            }
        }
    });

    equal(
        $('#qunit-fixture').find('.it_IT').length,
        1, 
        'Italian appears only once'
    );
  });



  //////////////////////////////////////////////////////////////////////////////
  module('translate', { setup: function () {
    addDropdownWidgetFunc();
  }});

  test('language selected callback is called after selection', function () {

    $('#qunit-fixture').append([
        '<div id="title">hello</div>',
        '<div id="subtitle">world</div>'
    ].join(''));

    var gotCalledWith;

    $('#dropdown').localizationTool({
        'onLanguageSelected' : function (countryCode) {
            gotCalledWith = countryCode;
            return false;
        },
        'strings' : {
            'id:title' : {
                'en_GB': 'hello',
                'it_IT': 'ciao'
            },
            'id:subtitle': {
                'en_GB': 'world',
                'it_IT': 'mondo'
            }
        }
    });

    $('#dropdown').localizationTool('_onLanguageSelected', $('<li class="en_GB"></li>'));

    equal(gotCalledWith, 'en_GB', 'got called');
    
  });

  test('ids are translated as expected', function () {
    // fixture
    $('#qunit-fixture').append([
        '<h1 id="translateThis">This is something</h1>',
        '<p id="translateThisToo">This is something bad!</p>'
    ].join(''));

    // initialize
    $('#dropdown').localizationTool({
        strings : {
            'id:translateThis' : {
                it_IT : 'Ciò &egrave; qualcosa',
            },
            'id:translateThisToo' : {
                it_IT : "Ci&ograve; è qualcos'altro"
            }
        }
    });

    // trigger translation
    $('#dropdown').localizationTool('translate', 'it_IT');

    // check all is translated as expected
    equal($('#translateThis').html(), 'Ciò è qualcosa', 'translated as expected');
    equal($('#translateThisToo').html(), "Ciò è qualcos'altro");

    // reset back to english
    $('#dropdown').localizationTool('translate');

    // check all is translated back as expected
    equal($('#translateThis').html(), 'This is something', 'translated back as expected');
    equal($('#translateThisToo').html(), 'This is something bad!');

  });

  test('classes are translated as expected', function () {
    // fixture
    $('#qunit-fixture').append([
        '<h1 class="localized">This is something</h1>',
        '<p class="localized">This is something</p>'
    ].join(''));

    // initialize
    $('#dropdown').localizationTool({
        strings : {
            'class:localized' : {
                it_IT : "Questo è qualcosa"
            }
        }
    });

    // trigger translation
    $('#dropdown').localizationTool('translate', 'it_IT');

    // check all is translated as expected
    $('.localized').each(function (i, e) {
        equal($(e).html(), 'Questo è qualcosa', 'translated as expected ' + i);
    });

    // reset back to english
    $('#dropdown').localizationTool('translate');

    // check all is translated back as expected
    $('.localized').each(function (i, e) {
        equal($(e).html(), 'This is something', 'translated back as expected ' + i);
    });
  });

  test('ids have precedence over class translation', function () {
    // fixture
    $('#qunit-fixture').append([
        '<h1 id="priority" class="localized">This is something</h1>',
        '<p class="localized">This is something</p>'
    ].join(''));

    // initialize
    $('#dropdown').localizationTool({
        strings : {
            'id:priority': {
                it_IT : "Priority!"
            },
            'class:localized' : {
                it_IT : "Questo è qualcosa"
            }
        }
    });

    // trigger translation
    $('#dropdown').localizationTool('translate', 'it_IT');

    // check all is translated as expected
    equal($('#priority').html(), 'Priority!', 'id translated according to id rule');
    equal($('p.localized').html(), 'Questo è qualcosa', 'the remaining class is translated as expected');

    // reset back to english
    $('#dropdown').localizationTool('translate');

    // check all is translated back as expected
    $('.localized').each(function (i, e) {
        equal($(e).html(), 'This is something', 'translated back as expected ' + i);
    });
  });

  test('throws error when attempting to translate classes elements containing different text', function () {
    // fixture
    $('#qunit-fixture').append([
        '<p class="localized">This is something</p>',
        '<p class="localized">This is something else</p>'
    ].join(''));

    // initialize
    throws(
        function () {
            $('#dropdown').localizationTool({
                strings : {
                    'class:localized' : {
                        it_IT : "Questo è qualcosa"
                    }
                }
            });
        }, 'Throws exception'
    );

  });

  test('throws error when attempting to translate classes elements containing elements other than text', function () {
    // fixture
    $('#qunit-fixture').append([
        '<p class="localized">This <b>is</b> something</p>',
    ].join(''));

    // initialize
    throws(
        function () {
            $('#dropdown').localizationTool({
                strings : {
                    'class:localized' : {
                        it_IT : "Questo è qualcosa"
                    }
                }
            });
        }, 'Throws exception'
    );

  });

  test('throws error when attempting to translate multiple classes elements and one of them contains multiple sub-elements', function () {
    // fixture
    $('#qunit-fixture').append([
        '<p class="localized">This <b>is</b> something</p>',
        '<p class="localized">This is something</p>',
        '<p class="localized">This is something</p>',
        '<p class="localized">This is something</p>',
        '<p class="localized">This is something</p>',
        '<p class="localized">This is something</p>',
        '<p class="localized">This is something</p>',
        '<p class="localized">This is something</p>',
        '<p class="localized">This is something</p>'
    ].join(''));

    // initialize
    throws(
        function () {
            $('#dropdown').localizationTool({
                strings : {
                    'class:localized' : {
                        it_IT : "Questo è qualcosa"
                    }
                }
            });
        }, 'Throws exception'
    );

  });

  test('elements are translated as expected', function () {
    // fixture
    $('#qunit-fixture').append([
        '<h5>This is something</h5>',
        '<h5>This is something</h5>'
    ].join(''));

    // initialize
    $('#dropdown').localizationTool({
        strings : {
            'element:h5' : {
                it_IT : "Questo è qualcosa"
            }
        }
    });

    // trigger translation
    $('#dropdown').localizationTool('translate', 'it_IT');

    // check all is translated as expected
    $('h5').each(function (i, e) {
        equal($(e).html(), 'Questo è qualcosa', 'translated as expected ' + i);
    });

    // reset back to english
    $('#dropdown').localizationTool('translate');

    // check all is translated back as expected
    $('h5').each(function (i, e) {
        equal($(e).html(), 'This is something', 'translated back as expected ' + i);
    });
  });

  test('classes have precedence over element translation', function () {
    // fixture
    $('#qunit-fixture').append([
        '<h5 class="priority">This is something</h5>',
        '<h5>This is something</h5>'
    ].join(''));

    // initialize
    $('#dropdown').localizationTool({
        strings : {
            'class:priority': {
                it_IT : "Priority!"
            },
            'element:h5' : {
                it_IT : "Questo è qualcosa"
            }
        }
    });

    // trigger translation
    $('#dropdown').localizationTool('translate', 'it_IT');

    // check all is translated as expected
    equal($('h5.priority').html(), 'Priority!', 'id translated according to id rule');
    equal($('h5:not(.priority)').html(), 'Questo è qualcosa', 'the remaining element is translated as expected');

    // reset back to english
    $('#dropdown').localizationTool('translate');

    // check all is translated back as expected
    $('h5').each(function (i, e) {
        equal($(e).html(), 'This is something', 'translated back as expected ' + i);
    });
  });

  test('ids have precedence over element translation', function () {
    // fixture
    $('#qunit-fixture').append([
        '<h5 id="priority">This is something</h5>',
        '<h5>This is something</h5>'
    ].join(''));

    // initialize
    $('#dropdown').localizationTool({
        strings : {
            'id:priority': {
                it_IT : "Priority!"
            },
            'element:h5' : {
                it_IT : "Questo è qualcosa"
            }
        }
    });

    // trigger translation
    $('#dropdown').localizationTool('translate', 'it_IT');

    // check all is translated as expected
    equal($('h5#priority').html(), 'Priority!', 'id translated according to id rule');
    equal($('h5:not(#priority)').html(), 'Questo è qualcosa', 'the remaining class is translated as expected');

    // reset back to english
    $('#dropdown').localizationTool('translate');

    // check all is translated back as expected
    $('h5').each(function (i, e) {
        equal($(e).html(), 'This is something', 'translated back as expected ' + i);
    });
  });

  test('throws error when attempting to translate elements containing different text', function () {
    // fixture
    $('#qunit-fixture').append([
        '<p class="localized">This is something</p>',
        '<p class="localized">This is something else</p>'
    ].join(''));

    // initialize
    throws(
        function () {
            $('#dropdown').localizationTool({
                strings : {
                    'class:localized' : {
                        it_IT : "Questo è qualcosa"
                    }
                }
            });
        }, 'Throws exception'
    );

  });

  test('throws error when attempting to translate elements containing elements other than text', function () {
    // fixture
    $('#qunit-fixture').append([
        '<p>This <b>is</b> something</p>',
    ].join(''));

    // initialize
    throws(
        function () {
            $('#dropdown').localizationTool({
                strings : {
                    'element:p' : {
                        it_IT : "Questo è qualcosa"
                    }
                }
            });
        }, 'Throws exception'
    );

  });

  test('throws error when attempting to translate multiple classes elements and one of them contains multiple sub-elements', function () {
    // fixture
    $('#qunit-fixture').append([
        '<p">This <b>is</b> something</p>',
        '<p">This is something</p>',
        '<p">This is something</p>',
        '<p">This is something</p>',
        '<p">This is something</p>',
        '<p">This is something</p>',
        '<p">This is something</p>',
        '<p">This is something</p>',
        '<p">This is something</p>'
    ].join(''));

    // initialize
    throws(
        function () {
            $('#dropdown').localizationTool({
                strings : {
                    'element:p' : {
                        it_IT : "Questo è qualcosa"
                    }
                }
            });
        }, 'Throws exception'
    );

  });


  
  //////////////////////////////////////////////////////////////////////////////
  module('_findSubsetOfUsedLanguages', { setup: function () {
    addDropdownWidgetFunc();
  }});

  test('one language in common', function () {
    var commonLanguages = $('#dropdown')
        .localizationTool({})
        .localizationTool('_findSubsetOfUsedLanguages',
            {
                'string1' : {
                   'it_IT' : 'translation1',
                   'es_ES' : 'translation2',
                   'fr_FR' : 'translation3',
                },
                'string2' : {
                   'de_DE' : 'translation4',
                   'es_ES' : 'translation5',
                   'br_PT' : 'translation6'
                },
                'string3' : {
                   'en_US' : 'translation7',
                   'es_ES' : 'translation8',
                   'en_AU' : 'translation9'
                }
            }
        );

    deepEqual(commonLanguages, ['es_ES', 'en_GB']);
  });

  test('no language in common', function () {
    var commonLanguages = $('#dropdown')
        .localizationTool({})
        .localizationTool('_findSubsetOfUsedLanguages',
            {
                'string1' : {
                   'it_IT' : 'translation1',
                   'jp_JP' : 'translation2',
                   'fr_FR' : 'translation3',
                },
                'string2' : {
                   'de_DE' : 'translation4',
                   'es_ES' : 'translation5',
                   'br_PT' : 'translation6'
                },
                'string3' : {
                   'en_US' : 'translation7',
                   'es_ES' : 'translation8',
                   'en_AU' : 'translation9'
                }
            }
        );

    deepEqual(commonLanguages, ['en_GB']);
  });

  test('all languages in common', function () {
    var commonLanguages = $('#dropdown')
        .localizationTool({})
        .localizationTool('_findSubsetOfUsedLanguages',
            {
                'string1' : {
                   'it_IT' : 'translation1',
                   'jp_JP' : 'translation2',
                   'fr_FR' : 'translation3',
                },
                'string2' : {
                   'it_IT' : 'translation1',
                   'jp_JP' : 'translation2',
                   'fr_FR' : 'translation3',
                },
                'string3' : {
                   'it_IT' : 'translation1',
                   'jp_JP' : 'translation2',
                   'fr_FR' : 'translation3',
                }
            }
        );

    deepEqual(commonLanguages, [ "fr_FR", "it_IT", "jp_JP", "en_GB" ]);

  });

  test('no strings defined', function () {
    var commonLanguages = $('#dropdown')
        .localizationTool({})
        .localizationTool('_findSubsetOfUsedLanguages', {});

    deepEqual(commonLanguages, ['en_GB']);
  });




  //////////////////////////////////////////////////////////////////////////////
  module('_languageCodeToOrdinal', { setup: function () {
    addDropdownWidgetFunc();
  }});
  test('converts language codes to ordinal numbers', function () {
    var $dropdown = $('#dropdown').localizationTool({
        strings: {
            'string1' : {
               'it_IT' : 'translation1',
               'jp_JP' : 'translation2',
               'fr_FR' : 'translation3',
            },
            'string2' : {
               'it_IT' : 'translation1',
               'jp_JP' : 'translation2',
               'fr_FR' : 'translation3',
            },
            'string3' : {
               'it_IT' : 'translation1',
               'jp_JP' : 'translation2',
               'fr_FR' : 'translation3',
            }
        }
    });

    equal($dropdown.localizationTool('_languageCodeToOrdinal', 'it_IT'),
        1, 'got expected ordinal number for it_IT'
    );
    equal($dropdown.localizationTool('_languageCodeToOrdinal', 'jp_JP'),
        2, 'got expected ordinal number for jp_JP'
    );
    equal($dropdown.localizationTool('_languageCodeToOrdinal', 'fr_FR'),
        0, 'got expected ordinal number for fr_FR'
    );
    equal($dropdown.localizationTool('_languageCodeToOrdinal', 'en_GB'),
        3, 'default language'
    );

    throws(function () {
        $dropdown.localizationTool('_languageCodeToOrdinal', 'fooFie!');
    });
  });




  //////////////////////////////////////////////////////////////////////////////
  module('_ordinalToLanguageCode', { setup: function () {
    addDropdownWidgetFunc();
  }});
  test('converts language codes to ordinal numbers', function () {
    var $dropdown = $('#dropdown').localizationTool({
        strings: {
            'string1' : {
               'it_IT' : 'translation1',
               'jp_JP' : 'translation2',
               'fr_FR' : 'translation3',
            },
            'string2' : {
               'it_IT' : 'translation1',
               'jp_JP' : 'translation2',
               'fr_FR' : 'translation3',
            },
            'string3' : {
               'it_IT' : 'translation1',
               'jp_JP' : 'translation2',
               'fr_FR' : 'translation3',
            }
        }
    });

    equal($dropdown.localizationTool('_ordinalToLanguageCode', 1),
        'it_IT', 'got expected language code number for ordinal 1'
    );
    equal($dropdown.localizationTool('_ordinalToLanguageCode', 2),
        'jp_JP', 'got expected language code number for ordinal 2'
    );
    equal($dropdown.localizationTool('_ordinalToLanguageCode', 0),
        'fr_FR', 'got expected language code number for ordinal 0'
    );
    equal($dropdown.localizationTool('_ordinalToLanguageCode', 3),
        'en_GB', 'got expected language code number for ordinal 3'
    );

    // NOTE: string input
    equal($dropdown.localizationTool('_ordinalToLanguageCode', "2"),
        'jp_JP', 'got expected language code number for ordinal 2'
    );

    throws(function () {
        $dropdown.localizationTool('_ordinalToLanguageCode', 4);
    }, 'out of right bound of array');

    throws(function () {
        $dropdown.localizationTool('_ordinalToLanguageCode', -1);
    }, 'out of left bound of array');
  });

}(jQuery));
