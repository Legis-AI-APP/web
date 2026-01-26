# AGENTS.md

Guía para que la IA mantenga **principios de diseño, estilo de código y convenciones**
consistentes en este repositorio, independientemente del lenguaje, framework o infraestructura utilizada.

Este documento unifica **principios conceptuales**, **criterios de diseño** y **ejemplos ilustrativos**, sin imponer decisiones tecnológicas específicas.

El objetivo no es definir *cómo* implementar, sino *cómo pensar* el código.

---

## Principios fundamentales

1. El código se lee más veces de las que se escribe
2. La claridad es más importante que la abstracción
3. Las decisiones implícitas generan deuda técnica
4. La complejidad debe estar localizada
5. El dominio manda, la tecnología acompaña

---

## Organización del proyecto

* Organizar el código por **feature, dominio o capacidad**, no por tipo técnico.
* Un feature debe poder entenderse de forma aislada.
* El código transversal debe estar explícitamente separado.

Ejemplo conceptual:

```
/auth
/email
/users
/config
/errors
```

**Criterios**:

* Evitar estructuras genéricas tipo `controllers/`, `services/`, `utils/` en la raíz.
* La estructura debe reflejar cómo se modela el negocio, no el framework.

---

## Convenciones de nombres

* Los nombres deben expresar **intención**, no implementación.
* Un lector debe entender el rol de una pieza de código sin abrirla.

Buenas prácticas:

* Clases / módulos: sustantivos claros
* Funciones: verbos que indiquen acción
* Evitar abreviaturas salvo que sean universalmente conocidas

**Regla práctica**:
Si necesitás un comentario para explicar un nombre, el nombre es incorrecto.

---

## Capas y responsabilidades

Separar claramente:

* **Entrada**: transporte, IO, protocolos (HTTP, CLI, eventos, etc.)
* **Aplicación**: orquestación de casos de uso
* **Dominio**: reglas de negocio y decisiones
* **Infraestructura**: persistencia, servicios externos, proveedores

**Principios**:

* El dominio no conoce detalles de transporte ni infraestructura
* Las capas externas dependen de las internas, nunca al revés
* El flujo principal debe leerse de arriba hacia abajo

---

## Manejo de errores

* Los errores son parte del diseño, no casos excepcionales.
* Preferir errores explícitos con significado de dominio.
* Centralizar la traducción de errores técnicos a errores de usuario.

Buenas prácticas:

* No propagar errores técnicos sin contexto
* No usar errores genéricos para flujos esperados
* Un error debe poder entenderse sin stacktrace

---

## Validación de datos

* Validar los datos **lo antes posible**, en los límites del sistema.
* Separar validación de formato de reglas de negocio.

**Principios**:

* Los datos inválidos no deben avanzar en el flujo
* La validación no debe estar dispersa
* Las reglas deben ser reutilizables y testeables

---

## Modelos y contratos

Distinguir claramente entre:

* Modelos de dominio
* Modelos de entrada/salida (APIs, UI, integraciones)
* Modelos de persistencia

**Principios**:

* Un modelo no sirve para todo
* Cambiar un contrato externo no debe romper el dominio
* Los contratos deben ser explícitos y estables

---

## Configuración

* La configuración define comportamiento, no el código.
* Valores variables no deben estar hardcodeados.
* La configuración debe poder cambiar sin recompilar.

**Principios**:

* Configurar > condicionar con `if`
* Fallar rápido ante configuración inválida
* La configuración también es parte del contrato

---

## Extensibilidad

* Preferir composición sobre herencia.
* Diseñar puntos de extensión claros.
* Agregar nuevas variantes no debería requerir modificar código existente.

Ejemplos conceptuales:

* Estrategias
* Plugins
* Adaptadores

**Regla**:
Si para agregar algo nuevo tenés que tocar muchas cosas, el diseño es incorrecto.

---

## Testing

* Testear **comportamiento**, no implementación.
* Cubrir flujos felices, errores esperados y casos límite relevantes.

**Principios**:

* Menos tests, pero más representativos
* Los tests deben leerse como documentación viva
* Un test frágil es peor que no tener test

---

## Estilo de código

* Preferir inmutabilidad.
* Funciones pequeñas y enfocadas.
* Evitar comentarios redundantes.
* Formato automático obligatorio.

**Principios**:

* El código debe ser autoexplicativo
* La consistencia es más importante que el gusto personal
* El formatter no se discute

---

## Regla final

Ante cualquier duda, priorizar:

1. Claridad sobre cleverness
2. Explicitud sobre magia
3. Simplicidad sobre generalización prematura
4. Dominio sobre tecnología

Si algo no se puede explicar fácilmente, probablemente esté mal diseñado.
