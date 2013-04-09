# Evtl: sudo chmod +x start.sh
echo ''
echo '###########################'
echo '# Forever: Starte Server ##'
echo '###########################'
forever stop controller-server.js
forever -o ~/.forever/controller-server.log --append start controller-server.js
echo 'Laufende Forever Prozesse:'
forever list
