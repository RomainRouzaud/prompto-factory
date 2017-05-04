function getParam(name) {
        // return new URL(window.location.href).searchParams.get(name);
        return new RegExp('[\?&]' + name + '=([^&#]*)').exec(window.location.href)[1];
    }

var catalog = {
    attributes : [],
    methods : [],
    categories : [],
    enumerations : [],
    tests : []
};

function makeId(name) {
    return name.replace(/[ ]/g, "_").replace(/[\"\'\(\),]/g,"");
}

function sortBy(a, f) {
    return a.sort(function(i1,i2) {
        return (i1[f]>i2[f]) ? 1 : ((i1[f]<i2[f]) ? -1 : 0);
    });
}

function findBy(a, f, v) {
    for(var i=0;i<a.length;i++) {
        if(a[i][f]==v)
            return i;
    }
    return -1;
}

function saveBlob() {
    var blob = new Blob(["Hello, world!"], {type: "text/plain;charset=utf-8"});
    saveAs(blob,'test.txt');
}

function editorReady() {
    var frame = document.getElementById("editor");
    frame.contentWindow.setDialect("E");
    frame.contentWindow.setProject(getParam("dbId"), true);
}

function showLibraries(input) {
    if(input.checked)
        $(".core").removeClass("no-core");
    else
        $(".core").addClass("no-core");
}

function htmlForList(list, type) {
    var html = [];
    list.map(function (item) {
        $.merge(html, ["<li id='", type, "_", makeId(item.name), "' class='list-group-item"]);
        if(item.core)
            html.push(" core");
        $.merge(html, ["'><a core='", item.core, "'>", item.name, "</a>"]);
        if(item.core)
            html.push("<span class='glyphicon glyphicon-cog'>");
        html.push("</li>");
    });
    return html.join("");
}

function attributesAdded(added, core) {
    added = added.map(function(name) { return { name : name, core : core }; });
    catalog.attributes = sortBy(catalog.attributes.concat(added), 'name');
    var html = htmlForList(catalog.attributes, "attribute");
    $('#attributes').html(html);
    // need to reinstall click handler
    $('#attributes > li').click(function (e) {
        e.stopPropagation();
        var a = $(e.target);
        var core = a.attr("core") ? eval(a.attr("core")) : false;
        setContent({attribute: a.text(), core: core});
    });
}

function attributesRemoved(removed) {
    removed.map(function(name) {
        var idx = findBy(catalog.attributes, 'name', name);
        if(idx>=0) {
            catalog.attributes.splice(idx, 1);
            $('#attribute_' + name).remove();
        }
    });
}

function categoriesAdded(added, core) {
    added = added.map(function(name) { return { name : name, core : core }; });
    catalog.categories = sortBy(catalog.categories.concat(added), 'name');
    var html = htmlForList(catalog.categories, "category");
    $('#categories').html(html);
    // need to reinstall click handler
    $('#categories > li').click(function (e) {
        e.stopPropagation();
        var a = $(e.target);
        var core = a.attr("core") ? eval(a.attr("core")) : false;
        setContent({category: a.text(), core: core});
    });
}

function categoriesRemoved(removed) {
    removed.map(function(name) {
        var idx = findBy(catalog.categories, 'name', name);
        if(idx>=0) {
            catalog.categories.splice(idx, 1);
            $('#category_' + name).remove();
        }
    });
}


function enumerationsAdded(added, core) {
    added = added.map(function(name) { return { name : name, core : core }; });
    catalog.enumerations = sortBy(catalog.enumerations.concat(added), 'name');
    var html = htmlForList(catalog.enumerations, "enumeration");
    $('#enumerations').html(html);
    // need to reinstall click handler
    $('#enumerations > li').click(function (e) {
        e.stopPropagation();
        var a = $(e.target);
        var core = a.attr("core") ? eval(a.attr("core")) : false;
        setContent({enumeration: a.text(), core: core});
    });
}

function enumerationsRemoved(removed) {
    removed.map(function(name) {
        var idx = findBy(catalog.enumerations, 'name', name);
        if(idx>=0) {
            catalog.enumerations.splice(idx, 1);
            $('#enumeration_' + name).remove();
        }
    });
}

function testsAdded(added, core) {
    added = added.map(function(name) { return { name : name, core : core }; });
    catalog.tests = sortBy(catalog.tests.concat(added), 'name');
    var html = htmlForList(catalog.tests, "test");
    $('#tests').html(html);
    // need to reinstall click handler
    $('#tests > li').click(function (e) {
        e.stopPropagation();
        var a = $(e.target);
        var core = a.attr("core") ? eval(a.attr("core")) : false;
        setContent({test: a.text(), core: core});
    });
}

function testsRemoved(removed) {
    removed.map(function(name) {
        var idx = findBy(catalog.tests, 'name', name);
        if(idx>=0) {
            catalog.tests.splice(idx, 1);
            $('#test_' + makeId(name)).remove();
        }
    });
}

function htmlForMethods(methods) {
    var html = [];
    methods.map(function(method) {
        if(method.protos.length>1) {
            html.push("<li class='list-group-item");
            if(method.core)
                html.push(" core");
            $.merge(html, ["' id='method_",
                method.name,
                "'><label class='tree-toggler nav-header'>",
                method.name,
                "</label>",
                "<ul class='list-group method' id='method_",
                method.name,
                "'>" ]);
            method.protos.map( function(proto) {
                html.push("<li class='list-group-item");
                if(method.core)
                    html.push(" core");
                $.merge(html, ["' id='proto_",
                    makeId(proto.proto),
                    "'><a core='",
                    method.core,
                    "' main='",
                    proto.main,
                    "'>",
                    proto.proto,
                    "</a>" ]);
                if(method.core)
                    html.push("<span class='glyphicon glyphicon-cog'>");
                html.push("</li>");

            });
            html.push("</ul></li>");
        } else {
            html.push("<li class='list-group-item");
            if (method.core)
                html.push(" core");
            $.merge(html, ["' id='method_",
                method.name,
                "'><a proto='",
                method.protos[0].proto,
                "' core='",
                method.core,
                "' main='",
                method.protos[0].main,
                "'>",
                method.name,
                "</a>"]);
            if(method.core)
                html.push("<span class='glyphicon glyphicon-cog'>");
            html.push("</li>");
        }
    });
    return html.join("");

}

function methodsAdded(added, core) {
    added = added.map(function(method) { method.core = core; return method; });
    added = catalog.methods.concat(added);
    catalog.methods = sortBy(added, 'name');
    var html = htmlForMethods(catalog.methods);
    $('#methods').html(html);
    // need to reinstall click handlers
    $('#methods > li').click(function (e) {
        e.stopPropagation();
        var a = $(e.target);
        var core = a.attr("core") ? eval(a.attr("core")) : false;
        var main = a.attr("main") ? eval(a.attr("main")) : false;
        var proto = a.attr("proto");
        var id = {method: a.text(), proto : proto, core: core, main: main};
        setContent(id);
    });
    catalog.methods.map( function(method) {
        $('#method_' + method.name + ' > li').click(function (e) {
            e.stopPropagation();
            var a = $(e.target);
            var core = a.attr("core") ? eval(a.attr("core")) : false;
            var main = a.attr("main") ? eval(a.attr("main")) : false;
            id = { method : method.name, proto : a.text(), core: core, main: main };
            setContent(id);
        });
    });
}

function methodsRemoved(removed) {
    removed.map(function(method) {
        var idx1 = findBy(catalog.methods, 'name', method.name);
        if(idx1>=0) {
            var map = catalog.methods[idx1];
            if(map.protos.length==method.protos.length) {
                catalog.methods.splice(idx1, 1);
                $("#method_" + method.name).remove();
            } else {
                method.protos.map(function (proto) {
                    var idx2 = findBy(map.protos, 'proto', proto.proto);
                    if (idx2 >= 0) {
                        map.protos.splice(idx2, 1);
                        $("#method_" + method.name + " > #proto_" + makeId(proto.proto)).remove();
                    }
                });
            }
        }
    });
}

function catalogUpdated(delta) {
    // remove deleted elements
    if(delta.removed) {
        if (delta.removed.attributes) {
            attributesRemoved(delta.removed.attributes);
        }
        if (delta.removed.methods) {
            methodsRemoved(delta.removed.methods);
        }
        if (delta.removed.categories) {
            categoriesRemoved(delta.removed.categories);
        }
        if (delta.removed.enumerations) {
            enumerationsRemoved(delta.removed.enumerations);
        }
        if (delta.removed.tests) {
            testsRemoved(delta.removed.tests);
        }
    }
    // add newly created elements
    if(delta.added) {
        var core = eval(delta.core) || false;
        if (delta.added.attributes) {
            attributesAdded(delta.added.attributes, core);
        }
        if (delta.added.methods) {
            methodsAdded(delta.added.methods, core);
        }
        if (delta.added.categories) {
            categoriesAdded(delta.added.categories, core);
        }
        if (delta.added.enumerations) {
            enumerationsAdded(delta.added.enumerations, core);
        }
        if (delta.added.tests) {
            testsAdded(delta.added.tests, core);
        }
    }
    var input = $("#show-libs")[0];
    showLibraries(input);
}

$(document).ready(function () {

    $('#nav-dialect').click(function (e) {
        if(e.target.id.indexOf('dialect-')===0) {
            $('li').removeClass('active');
            $(e.target).parent().addClass('active');
            var dialect = e.target.id.substring('dialect-'.length, 'dialect-'.length + 1);
            var frame = document.getElementById("editor");
            frame.contentWindow.setDialect(dialect);
        }
    });
    $('label.tree-toggler').click(function () {
        $(this).parent().children('ul').toggle(300);
    });
});

var contentId = null;

function setContent(id) {
    if(id && id===contentId)
        return;
    contentId = id;
    var frame = document.getElementById("editor");
    frame.contentWindow.setContent(id);
}

function destroy() {
    if(contentId===null)
        window.alert("Nothing to destroy!");
    else {
        var id = contentId;
        contentId = null;
        var frame = document.getElementById("editor");
        frame.contentWindow.destroy(id);
    }
}

function revert() {
    // TODO confirm
    setContent(null);
    var frame = document.getElementById("editor");
    frame.contentWindow.setProject(getParam("dbId"), false); // TODO move to codebase.js
}

function commit() {
    // TODO confirm
    setContent(null);
    var frame = document.getElementById("editor");
    frame.contentWindow.commit();
}

function setRunMode(label) {
    $("#run-mode").html(" " + label + " " + "<span class='caret'/>");
}


function getRunMode() {
    var text = $("#run-mode").text();
    var mode = text.indexOf("compiled")>=0 ? "EXECUTE/" : "INTERPRET/";
    return mode + (text.indexOf("Server")>=0 ? "REMOTE" : "LOCAL");
}

function run() {
    var msg = getRunnableAlert(contentId);
    if(msg)
        alert(msg);
    else {
        switchUIToRunMode();
        var name = contentId.test || contentId.method;
        print("Running " + name + "...");
        var runMode = getRunMode();
        var frame = document.getElementById("editor");
        frame.contentWindow.runMethod(contentId, runMode);
    }
}

function done(data) {
    var button = document.getElementById("run-button");
    button.innerHTML = "Done";
}

function getRunnableAlert(id) {
    if (!id)
        return "Nothing to run!";
    else if(!id.test && !id.main)
        return "Can only run tests or main methods!";
    else
        return null;
}

function stop() {
    edit();
}

function edit() {
    switchUIToEditMode();
}

function switchUIToRunMode() {
    var doc = document.getElementById("output");
    doc.innerHTML = "";
    $(".edit-mode").hide();
    $(".run-mode").show();
    var button = document.getElementById("run-button");
    button.onclick = function() { stop(); };
    button.innerHTML = "Stop";
}

function switchUIToEditMode() {
    $(".run-mode").hide();
    $(".edit-mode").show();
    var button = document.getElementById("run-button");
    button.onclick = function() { run(); };
    button.innerHTML = "Run";
}

function print(msg) {
    var doc = document.getElementById("output");
    doc.innerHTML += msg + "<br/>";
}

// a utility method to inspect worker data in Firefox/Safari
function inspect(name) {
    var frame = document.getElementById("editor");
    frame.contentWindow.inspect(name);
}

// a utility method to inspect worker data in Firefox/Safari
function inspected(data) {
    console.log(data);
}