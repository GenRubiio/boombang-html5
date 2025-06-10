# Script para limpiar recursos del proyecto BoomBang
Write-Host "Deteniendo y eliminando contenedores del proyecto..." -ForegroundColor Cyan

# Parar y eliminar contenedores específicos
docker-compose down --rmi all --volumes --remove-orphans

# Eliminar volumen específico (dbdata)
if (docker volume ls -q --filter name=dbdata) {
    docker volume rm dbdata
    Write-Host "Volumen dbdata eliminado" -ForegroundColor Green
} else {
    Write-Host "El volumen dbdata no existe" -ForegroundColor Yellow
}

# Eliminar red boombang
if (docker network ls -q --filter name=boombang) {
    docker network rm boombang
    Write-Host "Red boombang eliminada" -ForegroundColor Green
} else {
    Write-Host "La red boombang no existe" -ForegroundColor Yellow
}

# Limpieza adicional del sistema (opcional)
Write-Host "Realizando limpieza general del sistema Docker..." -ForegroundColor Cyan
docker system prune -a -f --volumes

# Verificar estado final
Write-Host "`nEstado final del sistema Docker:" -ForegroundColor Cyan
docker ps -a
docker images
docker volume ls
docker network ls
docker system df

Write-Host "`nLimpieza completada!" -ForegroundColor Green