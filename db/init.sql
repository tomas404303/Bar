use master;
go

Create database moodBarSolutions;
go

use moodBarSolutions;
go

create table sucursales(
    id int identity(1,1) primary key,
    nombre varchar(100) not null,
    direccion varchar(100) not null,
    estado bit not null default 1 -- 1: activo, 0: inactivo
);
go

create table categoriaProducto(
    id int identity(1,1) primary key,
    categoria varchar(100) not null
);
go

create table roles(
    id int identity(1,1) primary key,
    cargo varchar(50) not null
);
go

create table tDocumento(
    id int identity(1,1) primary key,
    abrevicion varchar(5) not null,
    definicion varchar(100) not null
);
go

create table usuario(
    id int identity(1,1) primary key,
    nui varchar(15) not null,
    tipoDocumento int not null,
    nombres_apellidos varchar(150) not null,
    estadoUsuario bit not null,
    cargoDesempeña int not null,
    sedeOpera int not null,
    usuario varchar(100) not null,
    contraseña varchar(255) not null,
    constraint fk_usuario_documento foreign key (tipoDocumento) references tDocumento(id),
    constraint fk_usuario_roles foreign key (cargoDesempeña) references roles(id),
    constraint fk_usuario_sucursales foreign key (sedeOpera) references sucursales(id)
);
go

create table mesa (
    sedeDefinido int not null,
    cantidad int default 0,
    constraint fk_mesa_sucursal foreign key (sedeDefinido) references sucursales(id)
);
go

create table productos(
    id varchar(25) primary key,
    nombre varchar(100) not null,
    idCategoria int not null,
    costo decimal(18,2) not null,
    valorVenta decimal(18,2) not null,
    constraint fk_productos_categoria foreign key (idCategoria) references categoriaProducto(id)
);
go

create table inventario(
    idSucursal int not null,
    idProducto varchar(25) not null,
    cantidad int not null,
    constraint fk_inventario_sucursal foreign key (idSucursal) references sucursales(id),
    constraint fk_inventario_productos foreign key (idProducto) references productos(id)    
);
go

create table venta (
    id int identity(1,1) primary key,
    idSede int not null,
    estadoVenta bit not null,-- 0: Finalzado, 1: Proceso
    medioRecaudado int not null,-- 1: efectivo, 2: Tarjeta débito, 3: Tarjeta crédito
    total decimal(18,2) not null,
    numeroMesaAsociada int not null,
    fechaInicioVenta datetime2(0),
    fechaFinVenta datetime2(0),
    constraint fk_venta_sucursal foreign key (idSede) references sucursales(id)
);
go

create table detallesVenta (
    idVenta int not null,
    idProducto varchar(25) not null,
    fechaProcesado datetime2(0),
    cantidad int not null,
    precioVenta decimal(18,2) not null,
    subTotal decimal(18,2) not null,
    constraint fk_detallesVenta_venta foreign key (idVenta) references venta(id),
    constraint fk_detallesVenta_producto foreign key (idProducto) references productos(id)    
);
go

create table detallesVentaPreOrden (
    idVenta int not null,
    idProducto varchar(25) not null,
    cantidad int not null,
    precioVenta decimal(18,2) not null,
    subTotal decimal(18,2) not null,
    constraint fk_detallesVentaPreOrden_venta foreign key (idVenta) references venta(id),
    constraint fk_detallesVentaPreOrden_producto foreign key (idProducto) references productos(id)    
);
go

-- Trigger que inserta todos los productos existentes a la nueva sede con cantidad 0
create or alter trigger productosExistentesParaLaNuevasucursal
on sucursales
after insert
as
begin
    set nocount on;
    
    insert into inventario (idSucursal, idProducto, cantidad)
    select i.id, p.id, 0
    from productos p
    cross join inserted i;
end
go

-- Trigger que inserta a todas las sucursales el nuevo producto insertado con cantidad 0
create or alter trigger productoNuevoATodasLasSucursales
on productos
after insert
as
begin
    set nocount on;

    insert into inventario (idSucursal, idProducto, cantidad)
    select s.id, i.id, 0 
    from sucursales s
    cross join inserted i;

end
go

-- Trigger para insertar cantidad 0 de mesesas a la nueva sucursales
create or alter trigger insertarRegistroMesaSucursal
on sucursales
after insert
as
begin
    set nocount on;
    declare @idAlmacenado int;

    select @idAlmacenado = i.id from inserted i;

    insert into mesa (sedeDefinido, cantidad)
    values (@idAlmacenado, 0);
end
go

-- Trigger: Validar inventario antes de insertar en detallesVentaPreOrden
create or alter trigger validarInventarioAntesDePreOrden
on detallesVentaPreOrden
instead of insert
as
begin
    set nocount on;
    declare @idVenta int, @idProducto varchar(25), @cantidad int, @idSucursal int, @inventarioActual int;
    
    -- Solo soporta una fila por inserción, para múltiples filas usar cursor
    select @idVenta = i.idVenta, @idProducto = i.idProducto, @cantidad = i.cantidad from inserted i;
    select @idSucursal = v.idSede from venta v where v.id = @idVenta;
    select @inventarioActual = cantidad from inventario where idSucursal = @idSucursal and idProducto = @idProducto;
    
    if @cantidad > @inventarioActual or @cantidad <= 0
    begin
        raiserror('Cantidad inválida o insuficiente inventario para el producto en la sede.', 16, 1);
        return;
    end
    else
    begin
        insert into detallesVentaPreOrden (idVenta, idProducto, cantidad, precioVenta, subTotal)
        select idVenta, idProducto, cantidad, precioVenta, subTotal from inserted;
    end
end
GO

-- Trigger: Descontar inventario después de insertar en detallesVentaPreOrden
create or alter trigger descontarInventarioDespuesDePreOrden
on detallesVentaPreOrden
after insert
as
begin
    set nocount on;
    declare @idVenta int, @idProducto varchar(25), @cantidad int, @idSucursal int;
    
    -- Solo soporta una fila por inserción, para múltiples filas usar cursor
    select @idVenta = i.idVenta, @idProducto = i.idProducto, @cantidad = i.cantidad from inserted i;
    select @idSucursal = v.idSede from venta v where v.id = @idVenta;
    
    update inventario
    set cantidad = cantidad - @cantidad
    where idSucursal = @idSucursal and idProducto = @idProducto;
end
GO

insert into tDocumento (abrevicion, definicion)
values
    ('CC', 'Cédula de ciudadanía'),
    ('PA', 'Pasaporte'),
    ('CE', 'Cédula de extranjería'),
    ('TI', 'Tarjeta de identidad');
go

insert into roles (cargo)
values
    ('Waiter'),
    ('Cashier'),
    ('Administrator');
go

insert into sucursales(nombre, direccion, estado)
values
    ('la 93', 'Ubicado en la 93', 1);
go

insert into usuario (nui, tipoDocumento, nombres_apellidos, estadoUsuario,cargoDesempeña,sedeOpera,usuario, contraseña)
values
    ('1000000001', 
    1, 
    'dios', 
    1, 
    3, 
    1, 
    'dios', 
    'a488f3d394d1ac4a24e8b596afee0ce6$29e0d69fdbdbff3aa3d63fb147613a8f7ae132cd32d62c59e6d92c99ecfd1f2a');
go