"use strict";

// Mher Oganesyan, Kunal Juneja, Wilson Weng

var canvas;
var gl;

var numVertices  = 138;

var texSize = 64;

var pointsArray = [];
var normalsArray = [];
var texCoordsArray = [];

var texture;

var texCoord = [
    vec2(0, 0),
    vec2(0, 1),
    vec2(1, 1),
    vec2(1, 0)
];

var near = 1.0;
var far = 8.0;
var radius = 2.0;
var theta  = 20.0;
var phi    = 20.0;
var dr = 5.0 * Math.PI/180.0;

var  fovy = 45.0;  // Field-of-view in Y direction angle (in degrees)
var  aspect;       // Viewport aspect ratio

var eye;
const at = vec3(0.0, 0.0, 0.0);
const up = vec3(0.0, 0.0, 1.0);

var vertices = [

        vec4(-0.05, -0.10, 0.5),
        vec4(-0.05, 0.10, 0.5),
        vec4(0.05, 0.10, 0.5),
        vec4(0.05, -0.10, 0.5),
        vec4(0.05, -0.10, 0.25),
        vec4(-0.05, -0.10, 0.25),
        vec4(-0.05, -0.325, 0.25),
        vec4(0.05, -0.325, 0.25),
        vec4(0.05, -0.325, 0.10),
        vec4(-0.05, -0.325, 0.10),
        vec4(-0.05, -0.10, 0.10),
        vec4(0.05, -0.10, 0.10),
        vec4(0.05, -0.10, -0.5),
        vec4(-0.05, -0.10, -0.5),
        vec4(0.05, 0.10, -0.5),
        vec4(-0.05, 0.10, -0.5),
        vec4(-0.05, 0.10, 0.10),
        vec4(0.05, 0.10, 0.10),
        vec4(0.05, 0.325, 0.10),
        vec4(-0.05, 0.325, 0.10),
        vec4(-0.05, 0.325, 0.25),
        vec4(0.05, 0.325, 0.25),
        vec4(0.05, 0.10, 0.25),
        vec4(-0.05, 0.10, 0.25)

    ];

var lightPosition = vec4(-1.0, -1.0, 1.0, 0.0 );
var lightAmbient = vec4(0.6, 0.6, 0.6, 1.0 );
var lightDiffuse = vec4( 1.0, 1.0, 1.0, 1.0 );
var lightSpecular = vec4( 1.0, 1.0, 1.0, 1.0 );

var materialAmbient = vec4( 1.0, 1.0, 1.0, 1.0 );
var materialDiffuse = vec4( 1.0, 1.0, 1.0, 1.0);
var materialSpecular = vec4( 1.0, 0.8, 1.0, 1.0 );
var materialShininess = 100.0;

var ctm;
var ambientColor, diffuseColor, specularColor;
var modelView, projection;
var viewerPos;
var program;

var xAxis = 0;
var yAxis = 1;
var zAxis = 2;
var axis = 0;
var thetaM =[0, 0, 0];

var thetaLoc;

var flag = true;

function configureTexture( image ) {
    // image.crossOrigin = "anonymous";

    texture = gl.createTexture();
    gl.bindTexture( gl.TEXTURE_2D, texture );
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.texImage2D( gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image );
    gl.generateMipmap( gl.TEXTURE_2D );
    gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER,
        gl.NEAREST_MIPMAP_LINEAR );
    gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST );

    gl.uniform1i(gl.getUniformLocation(program, "texture"), 0);

    // image.src = "wood.gif";
}

function quad(a, b, c, d) {

     var t1 = subtract(vertices[b], vertices[a]);
     var t2 = subtract(vertices[c], vertices[b]);
     var normal = cross(t1, t2);
     var normal = vec3(normal);


     pointsArray.push(vertices[a]);
     normalsArray.push(normal);
     texCoordsArray.push(texCoord[0]);

     pointsArray.push(vertices[b]);
     normalsArray.push(normal);
     texCoordsArray.push(texCoord[1]);

     pointsArray.push(vertices[c]);
     normalsArray.push(normal);
     texCoordsArray.push(texCoord[2]);

     pointsArray.push(vertices[a]);
     normalsArray.push(normal);
     texCoordsArray.push(texCoord[0]);

     pointsArray.push(vertices[c]);
     normalsArray.push(normal);
     texCoordsArray.push(texCoord[2]);

     pointsArray.push(vertices[d]);
     normalsArray.push(normal);
     texCoordsArray.push(texCoord[3]);
}


function colorCube()
{

    quad( 1, 0, 3, 2 );
    quad( 3, 0, 5, 4 );
    quad( 5, 6, 7, 4);
    quad( 7, 6, 9, 8 );
    quad( 7, 6, 9, 8 );
    quad( 8, 9, 10, 11 );
    quad( 11, 10, 13, 12);
    quad( 12, 13, 15, 14);
    quad( 15, 16, 17, 14);
    quad( 17, 16, 19, 18);
    quad( 19, 20, 21, 18);
    quad( 20, 23, 22, 21);
    quad( 23, 1, 2, 22);
    quad( 4, 7, 8, 11);
    quad( 6, 5, 10, 9);
    quad( 2, 3, 4, 22);
    quad( 0, 1, 23, 5);
    quad( 22, 4, 11, 17);
    quad( 5, 23, 16, 10);
    quad( 21, 22, 17, 18);
    quad( 23, 20, 19, 16);
    quad( 17, 11, 12, 14);
    quad( 10, 16, 15, 13);

}

function init() {
    canvas = document.getElementById( "gl-canvas" );

    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 1.0, 1.0, 1.0, 1.0 );

    aspect =  (canvas.width/canvas.height);

    gl.enable(gl.DEPTH_TEST);

    //
    //  Load shaders and initialize attribute buffers
    //
    program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );

    colorCube();

    var nBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, nBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(normalsArray), gl.STATIC_DRAW );

    var vNormal = gl.getAttribLocation( program, "vNormal" );
    gl.vertexAttribPointer( vNormal, 3, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vNormal );

    var vBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(pointsArray), gl.STATIC_DRAW );

    var vPosition = gl.getAttribLocation(program, "vPosition");
    gl.vertexAttribPointer(vPosition, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);

    var tBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, tBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(texCoordsArray), gl.STATIC_DRAW );

    var vTexCoord = gl.getAttribLocation( program, "vTexCoord" );
    gl.vertexAttribPointer( vTexCoord, 2, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vTexCoord );

    var image = document.getElementById("texImage");
    configureTexture( image );

    thetaLoc = gl.getUniformLocation(program, "theta");

    viewerPos = vec3(0.0, 0.0, -20.0 );

    projection =  perspective(fovy, aspect, near, far); //ortho(-1, 1, -1, 1, -100, 100);

    var ambientProduct = mult(lightAmbient, materialAmbient);
    var diffuseProduct = mult(lightDiffuse, materialDiffuse);
    var specularProduct = mult(lightSpecular, materialSpecular);

    // document.getElementById("ButtonX").onclick = function(){axis = xAxis;};
    // document.getElementById("ButtonY").onclick = function(){axis = yAxis;};
    // document.getElementById("ButtonZ").onclick = function(){axis = zAxis;};
    // document.getElementById("ButtonT").onclick = function(){flag = !flag;};

    window.onkeydown = function(event){
        var key = event.key;
        console.log(key);

        switch (key) {
            case "ArrowLeft":
                axis = yAxis;
                thetaM[axis] += 2;
                break;
            case "ArrowRight":
                axis = yAxis;
                thetaM[axis] -= 2;
                break;
            case "ArrowUp":
                axis = xAxis;
                thetaM[axis] += 2;
                break;
            case "ArrowDown":
                axis = xAxis;
                thetaM[axis] -= 2;
                break;
        }
    };

    gl.uniform4fv(gl.getUniformLocation(program, "ambientProduct"),
       flatten(ambientProduct));
    gl.uniform4fv(gl.getUniformLocation(program, "diffuseProduct"),
       flatten(diffuseProduct) );
    gl.uniform4fv(gl.getUniformLocation(program, "specularProduct"),
       flatten(specularProduct) );
    gl.uniform4fv(gl.getUniformLocation(program, "lightPosition"),
       flatten(lightPosition) );

    gl.uniform1f(gl.getUniformLocation(program,
       "shininess"),materialShininess);

    gl.uniformMatrix4fv( gl.getUniformLocation(program, "projectionMatrix"),
       false, flatten(projection));

    render();
}

window.onload = init;

var render = function(){

    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    //if(flag) thetaM[axis] += 2;
    // if(xAxis) theta += dr;
    // if(yAxis) phi += dr;
    //theta += dr;

    eye = vec3(radius*Math.sin(theta)*Math.cos(phi),
        radius*Math.sin(theta)*Math.sin(phi), radius*Math.cos(theta));
    modelView = mat4();
    modelView = lookAt(eye, at , up);

    // modelView = mat4();
    modelView = mult(modelView, rotate(thetaM[xAxis], [1, 0, 0] ));
    modelView = mult(modelView, rotate(thetaM[yAxis], [0, 1, 0] ));
    modelView = mult(modelView, rotate(thetaM[zAxis], [0, 0, 1] ));

    gl.uniformMatrix4fv( gl.getUniformLocation(program,
            "modelViewMatrix"), false, flatten(modelView) );

    gl.drawArrays( gl.TRIANGLES, 0, numVertices );


    requestAnimFrame(init);
}
