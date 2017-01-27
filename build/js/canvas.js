
window.onload = function() {

    fabric.Group.prototype.hasControls = false;

    var multiple = 2.34;
    var imagesLoaded = document.querySelectorAll('.b-images__item img');

    for (var i = 0; i < imagesLoaded.length; i++) {
        var width = imagesLoaded[i].offsetWidth;
        var height = imagesLoaded[i].offsetHeight;
        imagesLoaded[i].style.width = width / multiple + "px";
        imagesLoaded[i].style.height = height / multiple + "px";
        imagesLoaded[i].style.opacity = 1;
    }

    var canvas = new fabric.Canvas('canvas', { hasControls: false });

    function handleDragStart(e) {
        this.classList.add('img_dragging');
    }

    function handleDragOver(e) {
        if (e.preventDefault) {
            e.preventDefault(); // Necessary. Allows us to drop.
        }

        e.dataTransfer.dropEffect = 'copy'; // See the section on the DataTransfer object.
        // NOTE: comment above refers to the article (see top) -natchiketa

        return false;
    }

    function handleDragEnter(e) {
        document.querySelector('.b-pattern__text').classList.add('over');
    }

    function handleDragLeave(e) {
        document.querySelector('.b-pattern__text').classList.remove('over');
    }

    function setDataImg(newImage, img) {

        var dataWidth = Math.round(newImage.width * newImage.scaleX);
        var dataHeight = Math.round(newImage.height * newImage.scaleY);

        var canvasEl = fabric.util.createCanvasElement();
        canvasEl.width = dataWidth;
        canvasEl.height = dataHeight;

        var context = canvasEl.getContext('2d');
        context.drawImage(img, 0, 0, canvasEl.width, canvasEl.height);

        var imageData = context.getImageData(0, 0, canvasEl.width, canvasEl.height);    

        var data = imageData.data;
        var imgArray = [];

        for (var i = 0, len = data.length; i < len; i += 4) {
            if (data[i + 3] == 0) {
                imgArray.push('no');
            } else {
                imgArray.push('yes');
            }
        }

        // console.log(imgArray);

        function createArray() {

            var area = new Array(dataHeight);
            for (var i = 0; i < area.length; i++)
                area[i] = new Array(dataWidth);
            var counter = 0;
            for (var j = 0; j < dataHeight; j++) {
                for (var n = 0; n < dataWidth; n++) {

                    area[j][n] = imgArray[counter];
                    counter++;
                }
            }
            return area;
        }

        var newArr = createArray();
        // console.log(newArr);            

        function rotateArray(arr) {
            var width = arr[0].length;
            var height = arr.length;

            var copy = new Array(width);

            for (var n = 0; n < copy.length; n++)
                copy[n] = new Array(height);

            for (var i = 0; i < height; i++) {
                for (var j = 0; j < width; j++) {
                    copy[j][height - i - 1] = arr[i][j];
                }
            }

            return copy;
        }
        var newArr90 = rotateArray(newArr);

        var newArr180 = rotateArray(newArr90);

        var newArr270 = rotateArray(newArr180);

        newImage.set({
            'data': newArr,
            'data90': newArr90,
            'data180': newArr180,
            'data270': newArr270
        });
    }


    function handleDrop(e) {
        document.querySelector('.b-pattern__text').style.display = "none";
        // this / e.target is current target element.

        if (e.preventDefault) {
            e.preventDefault(); // stops the browser from redirecting.
        }
        if (e.stopPropagation) {
            e.stopPropagation(); // stops the browser from redirecting.
        }

        var img = document.querySelector('.b-images__item img.img_dragging');


        var newImage = new fabric.Image(img, {
            width: img.width,
            height: img.height,
            // Set the center of the new object based on the event coordinates relative
            // to the canvas container.
            left: e.layerX - Math.ceil(img.width / 2),
            top: e.layerY - Math.ceil(img.height / 2),
            hasControls: false,
            colorsArray: JSON.parse(img.getAttribute('data-color')),
            // scaleX: 0.5,
            // scaleY: 0.5,
        });
        // console.log(newImage.colorsArray);        

        canvas.add(newImage);

        limitMoveObject(newImage);

        canvas.renderAll();

        setDataImg(newImage, img);

        // console.log(newImage);

        return false;
    }


    function handleDragEnd(e) {
        this.classList.remove('img_dragging');
    }  


    if (Modernizr.draganddrop) {

        var images = document.querySelectorAll('.b-images__item img');
        [].forEach.call(images, function(img) {
            img.addEventListener('dragstart', handleDragStart, false);
            img.addEventListener('dragend', handleDragEnd, false);
        });

        // Bind the event listeners for the canvas
        var canvasContainer = document.getElementById('canvas-container');
        canvasContainer.addEventListener('dragenter', handleDragEnter, false);
        canvasContainer.addEventListener('dragover', handleDragOver, false);
        canvasContainer.addEventListener('dragleave', handleDragLeave, false);
        canvasContainer.addEventListener('drop', handleDrop, false);


    } else {
        // Replace with a fallback to a library solution.
        alert("This browser doesn't support the HTML5 Drag and Drop API.");
    }

    // net canvas

    function hideNet() {
        canvas.backgroundImage = null;
        canvas.renderAll(canvas);
    }

    function setNet(grid) {
        var canvasBg = new fabric.Canvas('bg', { width: canvas.width, height: canvas.height });
        var grid = grid ? grid : 50;

        // create grid

        for (var z = 1; z < (836 / grid); z++) {
            canvasBg.add(new fabric.Line([z * grid, 0, z * grid, 568], { stroke: '#ccc', selectable: false }));
            canvasBg.add(new fabric.Line([0, z * grid, 836, z * grid], { stroke: '#ccc', selectable: false }))
        }

        var png = canvasBg.toDataURL('png');

        canvas.setBackgroundImage(png, canvas.renderAll.bind(canvas), { backgroundImageStretch: false });
    }

    var netButton = document.querySelector('.b-action__btn_net');
    netButton.onclick = function() {
        if (this.checked) {
            if (gridButton.value == 0) {
                setNet();
            } else {
                setNet(gridButton.value);
            }

        } else {
            hideNet();
        }
    }

    var gridButton = document.querySelector('.b-action__btn_grid');
    gridButton.onchange = function(e) {
        hideNet();
        netButton.checked = true;
        setNet(this.value);
        // console.log(this.value)
    }

    var formGrid = document.querySelector('.b-pattern');
    formGrid.onsubmit = function(e) {
        return false
    };

    // get colors

    function getColors() {
            var colors = [];
            canvas.forEachObject(function(obj) {
                colors = colors.concat(obj.colorsArray);    
            });
            

            function unique(arr) {
              var obj = {};

              for (var i = 0; i < arr.length; i++) {
                var str = arr[i];
                obj[str] = true; // запомнить строку в виде свойства объекта
              }

              return Object.keys(obj); // или собрать ключи перебором для IE8-
            }

            return unique(colors);

    } 

    // scale obj

    function positionText(object, text) {
        text.left = Math.ceil(object.getBoundingRect().left + object.getBoundingRect().width / 2 - text.width / 2);
        text.top = Math.ceil(object.getBoundingRect().top + object.getBoundingRect().height / 2 - text.height / 2);
        text.setCoords();
    }

    function scaleObject() {

        var object = canvas.getActiveObject();

        if (object.hasOwnProperty('indexText')) {
            canvas.item(object.indexText).remove();
        }

        // console.log(object.hasOwnProperty('indexText')); 

        var scaleX = object.scaleX;
        var scaleY = object.scaleY;

        var tempScaleX = scaleX - 0.02;
        var tempScaleY = scaleY - 0.02;

        object.scaleX = tempScaleX;
        object.scaleY = tempScaleY;

        object.setCoords();
        canvas.renderAll();

        var persentScale = Math.round((1 - tempScaleX) * 100);

        var text = new fabric.Text("-" + persentScale + '%', {
            fontSize: 20,
            fill: '#000',
            textBackgroundColor: '#fff',
            hasControls: false,
            selectable: false,
            // id:object.id
        });

        // console.log(persentScale);

        positionText(object, text);
        canvas.add(text);
        object.set({ indexText: canvas.getObjects().indexOf(text) });
        // console.log(object)

        // canvas.renderAll(); 

        object.on('moving', function() {
            positionText(object, text);
        });

        // console.log(object.item(1));

        setDataImg(object, object._element);

    }

    var scaleButton = document.querySelector('.b-action__btn_scale');
    scaleButton.addEventListener('click', scaleObject, false);

    // clear canvas

    function clearObject() {

        var sure = confirm('Вы уверены, что ходите удалить раскладку?');
        if (sure) {
            canvas.clear();
            document.querySelector('.b-pattern__text').style.display = "block";
        }
        // canvas.clear();
    }

    var clearButton = document.querySelector('.b-action__btn_clear');
    clearButton.addEventListener('click', clearObject, false);

    // delete Object

    function deleteObject() {
        if (canvas.getActiveGroup()) {
            canvas.getActiveGroup().forEachObject(function(obj) { 
                if (obj.hasOwnProperty('indexText')) {
                    canvas.item(obj.indexText).remove();
                }                
                canvas.remove(obj);
            });
            canvas.discardActiveGroup().renderAll();
        } else {
            var obj = canvas.getActiveObject();
            if (obj.hasOwnProperty('indexText')) {
                canvas.item(obj.indexText).remove();
            }
            canvas.remove(obj);
        }
    }

    var deleteButton = document.querySelector('.b-action__btn_delete');
    deleteButton.addEventListener('click', deleteObject, false);

    // duplicate object

    function duplicateObject() {

        if (canvas.getActiveGroup()) {
            alert("Вы можете дублировать только отдельные изображение");
            return;
        } else {
            var parent = canvas.getActiveObject();
            var object = fabric.util.object.clone(parent);
            canvas.discardActiveObject();
            object.set("left", parent.left + parent.width);
            canvas.add(object);
            limitMoveObject(object);
            canvas.setActiveObject(object);

            if (object.hasOwnProperty('indexText')) {

                var text = fabric.util.object.clone(canvas.item(object.indexText));
                positionText(object, text);
                canvas.add(text);
                object.set({ indexText: canvas.getObjects().indexOf(text) });
                object.on('moving', function() {
                    positionText(object, text);
                });
            }

            canvas.forEachObject(function(obj) {
                if (obj === object) return;
                if (obj.isType('text')) return;
                if (object.intersectsWithObject(obj)) {

                    var object1 = object;
                    var object2 = obj;
                    // console.log(object1)

                    function createArray(object) {

                        var area = new Array(canvas.height);
                        for (var i = 0; i < area.length; i++)
                            area[i] = new Array(canvas.width);

                        // console.log(object.top)
                        var width = Math.round(object.getBoundingRect().width);
                        var height = Math.round(object.getBoundingRect().height);
                        var left = Math.round(object.getBoundingRect().left);
                        var top = Math.round(object.getBoundingRect().top);

                        // console.log(object.angle);

                        switch (object.angle) {
                            case 0:
                                for (var j = 0; j < height; j++) {
                                    for (var n = 0; n < width; n++) {
                                        area[j + top][n + left] = object.data[j][n];
                                    }
                                }
                                break;
                            case 90:
                                for (var j = 0; j < height; j++) {
                                    for (var n = 0; n < width; n++) {
                                        area[j + top][n + left] = object.data90[j][n];
                                    }
                                }
                                break;
                            case 180:
                                for (var j = 0; j < height; j++) {
                                    for (var n = 0; n < width; n++) {
                                        area[j + top][n + left] = object.data180[j][n];
                                    }
                                }
                                break;
                            case 270:
                                for (var j = 0; j < height; j++) {
                                    for (var n = 0; n < width; n++) {
                                        area[j + top][n + left] = object.data270[j][n];
                                    }
                                }
                                break;
                        }

                        return area;
                    }

                    var canvas1 = createArray(object1);
                    var canvas2 = createArray(object2);

                    var params = {};
                    params.width = (Math.max(Math.round(object1.getBoundingRect().width) + Math.round(object1.getBoundingRect().left), Math.round(object2.getBoundingRect().width) + Math.round(object2.getBoundingRect().left)) - Math.min(Math.round(object1.getBoundingRect().left), Math.round(object2.getBoundingRect().left)));
                    params.height = (Math.max(Math.round(object1.getBoundingRect().height) + Math.round(object1.getBoundingRect().top), Math.round(object2.getBoundingRect().height) + Math.round(object2.getBoundingRect().top)) - Math.min(Math.round(object1.getBoundingRect().top), Math.round(object2.getBoundingRect().top)));
                    params.left = (Math.min(Math.round(object1.getBoundingRect().left), Math.round(object2.getBoundingRect().left)));
                    params.top = (Math.min(Math.round(object1.getBoundingRect().top), Math.round(object2.getBoundingRect().top)));

                    function compareArray(canvas1, canvas2, params) {
                        for (var j = params.top; j < params.top + params.height; j++) {
                            for (var n = params.left; n < params.left + params.width; n++) {
                                if (canvas1[j][n] === 'yes' && canvas2[j][n] === 'yes') {
                                    // console.log('x = ' + n + ', y = ' + j)
                                    // object2.setOpacity(0.5);
                                    object1.setOpacity(0.5);

                                    return false
                                } else {
                                    // object2.setOpacity(1);
                                    // object1.setOpacity(1);
                                }
                            }
                        }
                    }

                    compareArray(canvas1, canvas2, params);

                } else {
                    // obj.setOpacity(1);
                }
            });

            // canvas.discardActiveObject();
        }

    }

    var duplicateButton = document.querySelector('.b-action__btn_duplicate');
    duplicateButton.addEventListener('click', duplicateObject, false);

    // turn object

    function turnObject() {
        if (canvas.getActiveGroup()) {
            // canvas.getActiveGroup().forEachObject(function(o) {
            //     var curAngle = o.getAngle();
            //     if (curAngle == 270) {
            //       o.setAngle(0);
            //     } else {
            //       o.setAngle(curAngle + 90);
            //     } 
            //     limitMoveObject(o);    
            //     o.setCoords();         
            // });
            // canvas.renderAll();
            alert("Вы можете поворичивать только отдельные изображение");
            return;
        } else {
            var object = canvas.getActiveObject();
            var curAngle = object.getAngle();
            if (curAngle == 270) {
                object.setAngle(0);
            } else {
                object.setAngle(curAngle + 90);
            }

            limitMoveObject(object);

            // object.setCoords();

            // console.log(object.getBoundingRect())

            canvas.renderAll();

        }
    }

    var turnButton = document.querySelector('.b-action__btn_turn');
    turnButton.addEventListener('click', turnObject, false);

    // zoom canvas

    function zoomCanvas(factor) {

        canvas.setHeight(canvas.getHeight() * factor);
        canvas.setWidth(canvas.getWidth() * factor);
        if (canvas.backgroundImage) {
            // Need to scale background images as well
            var bi = canvas.backgroundImage;
            bi.width = bi.width * factor;
            bi.height = bi.height * factor;
        }
        var objects = canvas.getObjects();
        for (var i in objects) {
            var scaleX = objects[i].scaleX;
            var scaleY = objects[i].scaleY;
            var left = objects[i].left;
            var top = objects[i].top;

            var tempScaleX = scaleX * factor;
            var tempScaleY = scaleY * factor;
            var tempLeft = left * factor;
            var tempTop = top * factor;

            objects[i].scaleX = tempScaleX;
            objects[i].scaleY = tempScaleY;
            objects[i].left = tempLeft;
            objects[i].top = tempTop;

            objects[i].setCoords();
        }
        canvas.renderAll();
        canvas.calcOffset();
    }

    // save to png

    function saveObject() {
        var error = false;
        canvas.forEachObject(function(obj) {
            if (obj.getOpacity() != 1) {
                error = true;
            }
        });

        if (error) {
            alert("Одно из изображений пересекается с другим");
        } else {
            canvas.discardActiveObject().discardActiveGroup();
            zoomCanvas(multiple);
            window.open(canvas.toDataURL('png'));
            zoomCanvas(multiple / (multiple * multiple));
            $.fancybox.open({
                href: '#pattern'
            });
        }

    }

    var saveButton = document.querySelector('.b-btn-b_save');
    saveButton.addEventListener('click', saveObject, false);

    // limit move object

    function limitMoveObject(object) {
        var obj = object;

        obj.setCoords();
        // top-left  corner
        if (obj.getBoundingRect().top < 0 || obj.getBoundingRect().left < 0) {
            obj.top = Math.max(obj.top, obj.top - obj.getBoundingRect().top);
            obj.left = Math.max(obj.left, obj.left - obj.getBoundingRect().left);
        }
        // bot-right corner
        if (obj.getBoundingRect().top + obj.getBoundingRect().height > obj.canvas.height || obj.getBoundingRect().left + obj.getBoundingRect().width > obj.canvas.width) {
            obj.top = Math.min(obj.top, obj.canvas.height - obj.getBoundingRect().height + obj.top - obj.getBoundingRect().top);
            obj.left = Math.min(obj.left, obj.canvas.width - obj.getBoundingRect().width + obj.left - obj.getBoundingRect().left);
        }

        obj.setCoords();
        // console.log(obj.currentHeight, obj.currentWidth);
    }

    // compare code

    function onChangeModified(e) {

        if (canvas.getActiveGroup()) {
            return
        }

        canvas.forEachObject(function(obj) {
            if (obj === e.target) return;
            if (obj.isType('text')) return;

            if (e.target.intersectsWithObject(obj)) {

                var object1 = e.target;
                var object2 = obj;
                // console.log(object1)

                function createArray(object) {

                    var area = new Array(canvas.height);
                    for (var i = 0; i < area.length; i++)
                        area[i] = new Array(canvas.width);

                    // console.log(object.top)
                    var width = Math.round(object.getBoundingRect().width);
                    var height = Math.round(object.getBoundingRect().height);
                    var left = Math.round(object.getBoundingRect().left);
                    var top = Math.round(object.getBoundingRect().top);

                    // console.log(object.angle);

                    switch (object.angle) {
                        case 0:
                            for (var j = 0; j < height; j++) {
                                for (var n = 0; n < width; n++) {
                                    area[j + top][n + left] = object.data[j][n];
                                }
                            }
                            break;
                        case 90:
                            for (var j = 0; j < height; j++) {
                                for (var n = 0; n < width; n++) {
                                    area[j + top][n + left] = object.data90[j][n];
                                }
                            }
                            break;
                        case 180:
                            for (var j = 0; j < height; j++) {
                                for (var n = 0; n < width; n++) {
                                    area[j + top][n + left] = object.data180[j][n];
                                }
                            }
                            break;
                        case 270:
                            for (var j = 0; j < height; j++) {
                                for (var n = 0; n < width; n++) {
                                    area[j + top][n + left] = object.data270[j][n];
                                }
                            }
                            break;
                    }

                    return area;
                }

                var canvas1 = createArray(object1);
                var canvas2 = createArray(object2);

                var params = {};
                params.width = (Math.max(Math.round(object1.getBoundingRect().width) + Math.round(object1.getBoundingRect().left), Math.round(object2.getBoundingRect().width) + Math.round(object2.getBoundingRect().left)) - Math.min(Math.round(object1.getBoundingRect().left), Math.round(object2.getBoundingRect().left)));
                params.height = (Math.max(Math.round(object1.getBoundingRect().height) + Math.round(object1.getBoundingRect().top), Math.round(object2.getBoundingRect().height) + Math.round(object2.getBoundingRect().top)) - Math.min(Math.round(object1.getBoundingRect().top), Math.round(object2.getBoundingRect().top)));
                params.left = (Math.min(Math.round(object1.getBoundingRect().left), Math.round(object2.getBoundingRect().left)));
                params.top = (Math.min(Math.round(object1.getBoundingRect().top), Math.round(object2.getBoundingRect().top)));

                // console.log(params)
                // console.log(object1)
                // console.log(object2)

                function compareArray(canvas1, canvas2, params) {
                    for (var j = params.top; j < params.top + params.height; j++) {
                        for (var n = params.left; n < params.left + params.width; n++) {
                            if (canvas1[j][n] === 'yes' && canvas2[j][n] === 'yes') {
                                // console.log('x = ' + n + ', y = ' + j)
                                // object2.setOpacity(0.5);
                                object1.setOpacity(0.5);

                                return false
                            } else {
                                // object2.setOpacity(1);
                                // object1.setOpacity(1);
                            }
                        }
                    }
                }

                compareArray(canvas1, canvas2, params);

            } else {
                // obj.setOpacity(1);
            }
        });

        // console.log(e.target)
    }

    canvas.on({
        'object:moving': function(e) {
            e.target.setOpacity(1);
            limitMoveObject(e.target);
        },
        'object:modified': onChangeModified
    });
}