'use strict';

/* Directives */

var app = angular.module('myApp.directives', ['ngFileUpload']);

app.directive("fileUpload", function ($compile) {
    return {
        restrict: 'E',
        replace: true,
        scope: {
            onSuccess: '&',
            onProgress: '&',
            onError: '&'
        },
        link: function (scope, elem, attr) {
            var text = elem.html();
            var component = "";
            component += "<div ngf-drop ngf-select ";
            component += "ngf-drag-over-class=\"'dragover'\" ngf-multiple=\"true\" ngf-allow-dir=\"true\" ";
            component += "accept=\"image\/*,application\/pdf\" ";
            component += "ngf-pattern=\"'image\/*,application\/pdf'\">" + text + "<\/div> ";
            component += "<div ngf-no-file-drop>File Upload is not supported for this browser<\/div> ";
            var wrapper = angular.element(component);
            wrapper.addClass(elem.attr('class'));
            wrapper.attr('ng-model', elem.attr('ng-model'));
            elem.html('');
            elem.before(wrapper);
            $compile(wrapper)(scope);
            wrapper.append(elem);
        },
        controller: ['$scope', '$timeout', 'Upload', function ($scope, $timeout, Upload) {

            $scope.$watch('files', function () {
                $scope.upload($scope.files);
            });

            $scope.upload = function (files) {
                if (files && files.length) {
                    for (var i = 0; i < files.length; i++) {
                        var file = files[i];
                        if (!file.$error) {
                            Upload.upload({
                                url: 'https://angular-file-upload-cors-srv.appspot.com/upload',
                                data: {
                                    username: $scope.username,
                                    file: file
                                }
                            }).then(function (response) {
                                if ($scope.onSuccess) {
                                    $scope.onSuccess({response: response});
                                }
                            }, function (error) {
                                if ($scope.onError) {
                                    $scope.onError({error: error});
                                }
                            }, function (event) {
                                if ($scope.onProgress) {
                                    $scope.onProgress({event: event});
                                }
                                var progressPercentage = parseInt(100.0 * event.loaded / event.total);
                            });
                        }
                    }
                }
            };
        }]
    };
});

app.directive("sectionButton", function () {

    var defaultConfig = {
        icon: 'fa-file-image-o',
        iconSize: 1
    };

    return {
        restrict: 'E',
        replace: true,
        require: 'ngModel',
        templateUrl: './directives/section-icon-selection.html',
        link: function ($scope, $element, $attrs, ngModel) {
            var button = $element.find('#button');
            button.addClass($element.attr('class'));
            $element.removeAttr('class');
        },
        controller: ['$scope', '$element', '$attrs', 'config', function ($scope, $element, $attrs, config) {
            var ngModel = $element.controller('ngModel');
            $scope.iconSize = $element.attr('icon-size') || defaultConfig.iconSize;

            ngModel.$render = function () {
                $scope.currentIcon = ngModel.$viewValue || defaultConfig.icon;
            };

            $scope.icons = config.sectionItems;
            $scope.changeCurrentIcon = function (icon) {
                $scope.currentIcon = icon;
                ngModel.$setViewValue(icon);
                $scope.popoverIsOpen = false;
            };
        }]
    };
});

app.directive("richTextEditor", function ($compile, $document) {

    var toolbarOptions = [
        ['bold', 'italic', 'underline'],
        [{'list': 'ordered'}, {'list': 'bullet'}],
        [{'size': ['small', 'normal', 'large', 'huge']}],
        [{'align': []}],
        ['clean']
    ];

    return {
        restrict: 'E',
        replace: true,
        require: 'ngModel',
        template: '<div></div>',
        link: function ($scope, $element, $attrs, ngModel) {
        },
        controller: ['$scope', '$element', '$attrs', function ($scope, $element, $attrs) {

            var ngModel = $element.controller('ngModel');

            $attrs.$observe('showToolbar', function () {
                $scope.showToolbar($scope.$eval($attrs.showToolbar));
            });

            $scope.showToolbar = function (value) {
                if (value) {
                    $scope.toolbarElement.removeClass('ng-hide');
                } else {
                    if (!$scope.toolbarElement.hasClass('ng-hide')) {
                        $scope.toolbarElement.addClass('ng-hide');
                    }
                }
            };

            $scope.editor = new Quill($element[0], {
                theme: 'snow',
                modules: {
                    toolbar: {
                        container: toolbarOptions
                    }
                }
            });

            $scope.editor.on('text-change', function () {
                var html = $element[0].children[0].innerHTML;
                if (html === '<p><br></p>') {
                    html = null;
                }
                ngModel.$setViewValue(html);
            });
            $scope.editor.on('selection-change', function (range) {
                if (range) {
                    return;
                }
                $scope.$apply(function () {
                    ngModel.$setTouched();
                });
            });

            ngModel.$render = function () {
                var html = ngModel.$viewValue || '';
                $scope.editor.pasteHTML(html);
            };

            $scope.toolbarElement = $element.parent().find('.ql-toolbar');
        }]
    };
});

/**
 * directive to validate passwords in the html-view
 *
 * @directive passwordInput
 */
app.directive('passwordInput', [function () {
    return {
        require: 'ngModel',
        link: function (scope, elem, attrs, ctrl) {
            var firstPassword = '#' + attrs.passwordInput;
            elem.add(firstPassword).on('keyup', function () {
                scope.$apply(function () {
                    ctrl.$setValidity('pwmatch', elem.val() === $(firstPassword).val());
                });
            });
        }
    }
}]);

/**
 * directive to open the datepicker
 *
 * @directive dateclick
 */
app.directive("dateclick", function () {
    return {
        link: function ($scope, element, attrs) {
            $scope.dateIsOpen = false;

            $scope.openCalendar = function (event) {
                event.preventDefault();
                event.stopPropagation();
                $scope.dateIsOpen = !$scope.dateIsOpen;
            };
        }
    }
});

/**
 * directive to open a dropdown-menu without
 * changing the route (href-directive)
 *
 * @directive dropdownclick
 */
app.directive("dropdownNoRouteChange", function () {
    return {
        link: function ($scope, element, attrs) {
            $scope.dropDownIsOpen = false;

            $scope.openDropDown = function (event) {
                $scope.dropDownIsOpen = !$scope.dropDownIsOpen;
            };
        }
    }
});

app.directive('focus', function ($timeout) {
    return {
        scope: {trigger: '@focus'},
        link: function (scope, element) {
            scope.$watch('trigger', function (value) {
                if (value === "true") {
                    $timeout(function () {
                        element[0].focus();
                    });
                }
            });
        }
    };
});

app.directive('focusOnShow', function ($timeout) {
    return {
        restrict: 'A',
        link: function ($scope, $element, $attr) {
            debugger;
            if ($attr.ngShow) {
                $scope.$watch($attr.ngShow, function (newValue) {
                    if (newValue) {
                        $timeout(function () {
                            $element[0].focus();
                        }, 0);
                    }
                })
            }
            if ($attr.ngHide) {
                $scope.$watch($attr.ngHide, function (newValue) {
                    if (!newValue) {
                        $timeout(function () {
                            $element[0].focus();
                        }, 0);
                    }
                })
            }

        }
    };
})

app.directive('focusOnSetVisible', function ($timeout) {
    return {
        restrict: 'A',
        link: function ($scope, $element, $attr) {
            if ($attr.ngStyle) {
                $scope.$watch($attr.ngStyle, function (newValue) {
                    if (newValue.visibility && newValue.visibility == 'visible') {
                        $timeout(function () {
                            $element[0].focus();
                        }, 0);
                    }
                })
            }
        }
    };
});

app.directive('contenteditable', ['$timeout', function ($timeout) {
    return {
        restrict: 'A',
        require: '?ngModel',
        link: function (scope, element, attrs, ngModel) {
            // don't do anything unless this is actually bound to a model
            if (!ngModel) {
                return
            }

            // options
            var opts = {}
            angular.forEach([
                'stripBr',
                'noLineBreaks',
                'selectNonEditable',
                'moveCaretToEndOnChange',
                'stripTags'
            ], function (opt) {
                var o = attrs[opt]
                opts[opt] = o && o !== 'false'
            })

            // view -> model
            element.bind('input', function (e) {
                scope.$apply(function () {
                    var html, html2, rerender
                    html = element.html()
                    rerender = false
                    if (opts.stripBr) {
                        html = html.replace(/<br>$/, '')
                    }
                    if (opts.noLineBreaks) {
                        html2 = html.replace(/<div>/g, '').replace(/<br>/g, '').replace(/<\/div>/g, '')
                        if (html2 !== html) {
                            rerender = true
                            html = html2
                        }
                    }
                    if (opts.stripTags) {
                        rerender = true
                        html = html.replace(/<\S[^><]*>/g, '')
                    }
                    ngModel.$setViewValue(html)
                    if (rerender) {
                        ngModel.$render()
                    }
                    if (html === '') {
                        // the cursor disappears if the contents is empty
                        // so we need to refocus
                        $timeout(function () {
                            element[0].blur()
                            element[0].focus()
                        })
                    }
                })
            })

            // model -> view
            var oldRender = ngModel.$render
            ngModel.$render = function () {
                var el, el2, range, sel
                if (!!oldRender) {
                    oldRender()
                }
                var html = ngModel.$viewValue || ''
                if (opts.stripTags) {
                    html = html.replace(/<\S[^><]*>/g, '')
                }

                element.html(html)
                if (opts.moveCaretToEndOnChange) {
                    el = element[0]
                    range = document.createRange()
                    sel = window.getSelection()
                    if (el.childNodes.length > 0) {
                        el2 = el.childNodes[el.childNodes.length - 1]
                        range.setStartAfter(el2)
                    } else {
                        range.setStartAfter(el)
                    }
                    range.collapse(true)
                    sel.removeAllRanges()
                    sel.addRange(range)
                }
            }
            if (opts.selectNonEditable) {
                element.bind('click', function (e) {
                    var range, sel, target
                    target = e.toElement
                    if (target !== this && angular.element(target).attr('contenteditable') === 'false') {
                        range = document.createRange()
                        sel = window.getSelection()
                        range.setStartBefore(target)
                        range.setEndAfter(target)
                        sel.removeAllRanges()
                        sel.addRange(range)
                    }
                })
            }
        }
    }
}]);