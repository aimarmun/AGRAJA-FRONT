# AGRJA-FRONT: Aplicación Web para la contratación de agricultores y venta de cajas de productos.

Agraja es mi proyecto de final de Bootcamp Fullstack.

Puedes verlo en acción aquí 👉 [https://demo.aimarmun.com](https://demo.aimarmun.com)

###### Características:

- Agraja aplicación que permite la contratación de agricultores y la venta de cajas de productos del campo.

- Desarrollado en Angular. Versión 17 migrada de la versión 16. Se puede encontrar sintaxis posterior a la versión 17 y sintaxis actual (versión 17).

- Los agricultores pueden trabajar en cuatro tipos de campos: hortalizas, cereales, leguminosas y frutales.

- Las cajas pueden ser de frutas, hortalizas, cereales o legumbres.

- También se permite la inserción y modificación de nuevos clientes. Estos clientes pueden contratar los servicios de los agricultores o pueden comprar cajas.

- Para el manejo de la aplicación existen dos tipos de perfiles: Administrador y Vendedor:
  
  - El **vendedor** puede hacer contrataciones de agricultores y ventas de cajas, pero no puede añadir ni modificar agricultores o cajas. El **administrador** puede hacer contrataciones y ventas de cajas, pero además puede modificar y añadir nuevas.

###### Otras características:

- Servicio de configuración de usuaro: Mantiene la configuración de usuario hasta abandonar la aplicación.

- Servicio de caché de imágenes: Carga las imágenes en memoria para una carga rápida.

- Utilización del nuevo tipo de bloque `@defer` en la listas de cajas y agricultores.

- Utilización de *skeletons* durante la carga de elementos.

- Servicio de configuración de aplicación: Permite configurar la URL de la API sin necesidad  de recompilar el código. También permite configurar mensajes (*toast*) de bienvenida.

# Instalación

Para instalar y configurar el proyecto, sigue estos pasos:

1. Node.js y Angular.
2. Clona el repositorio de GitHub.
3. Ejecuta `npm i` en  la consola de comandos.
4. Ejecuta `npm run start` para mostrar Agraja en modo depuración.
5. O ejecuta `npm run build` para preparar la aplicación para su publicación.

## Otra información:

Las imágenes están creadas con la IA de Adobe Firefly https://firefly.adobe.com/
