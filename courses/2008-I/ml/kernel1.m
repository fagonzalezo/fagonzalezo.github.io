%APRENDIZAJE DE MAQUINA
%EJEMPLO DE REGRESIÓN USANDO METODOS DE KERNEL


clear
X = rand(20,1) % generar 20 numeros aleatorios
%w=[2] %se define el parametro =2
%y = X*w + rand(20,1)/10 % se generan pares ordenados (lineales) con ruido
y = -(X-0.5).^2+ones(20,1)*0.25 + (rand(20,1)-0.5)/10; % (cuadraticos)

figure(1)
plot(X,y,'*'); %graficar x,y
title('Datos iniciales')

w1 = (X'*X)^-1*X'*y  % Obtener parametros de regresion
y1 = X*w1
figure(2)
plot(X,y,'r*',X,y1,'g*');
title('Primer ajuste lineal')

alpha = (X*X')^-1*y %obtener los parametros alfa
G1 = X*X' %matriz Gram
alpha1 = y'*(G1+eye(20))^-1
y1=(alpha1*G1)'
figure(3)
plot(X,y,'r*',X,y1,'g*');
title('Kernel Lineal')

G2=G1.*G1
alpha2 = y'*(G2+eye(20))^-1
y2=(alpha2*G2)'
figure(4)
plot(X,y,'*',X,y2,'o');
title('Kernel Cuadratico')

G2=G1.*G1
alpha2 = y'*(G2+0.1*eye(20))^-1
y2=(alpha2*G2)'
figure(5)
plot(X,y,'*',X,y2,'o');
title('Kernel Cuadratico modificado')

G3 = (G1+ones(20)) .* (G1+ones(20))
alpha3 = y'*(G3+0.1*eye(20))^-1
y3=(alpha3*G3)'
figure(6)
plot(X,y,'*',X,y3,'o');
title('Otro Kernel ')

G3 = (G1+ones(20)) .^5
alpha3 = y'*(G3+0.1*eye(20))^-1
y3=(alpha3*G3)'
figure(7)
plot(X,y,'*',X,y3,'o');
title('Ajuste 1')

G3 = (G1+ones(20)) .^15;
alpha3 = y'*(G3+0.1*eye(20))^-1;
y3=(alpha3*G3)';
figure(8)
plot(X,y,'*',X,y3,'o');
title('Ajuste 2')

G3 = (G1+ones(20)) .^50;
alpha3 = y'*(G3+0.1*eye(20))^-1;
y3=(alpha3*G3)';
figure(9)
plot(X,y,'*',X,y3,'o');
title('Sobre ajuste')

