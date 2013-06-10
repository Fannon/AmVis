#!/bin/bash

# Evtl: sudo chmod +x start.sh
# This Script uses https://github.com/nodejitsu/forever
# Forever should be installed globally (npm install forever -g)

echo ''
echo ''
echo '##################################################'
echo '# Amvis Controller Server                        #'
echo '# 2013 Simon Heimler                             #'
echo '##################################################'
echo '# Starting and monitoring with "Forever" Module  #'
echo '# Output Log: ~/.forever/amvis-out.log           #'
echo '# Error Log:  ~/.forever/amvis-err.log           #'
echo '##################################################'
echo ''
echo ''
echo '#################################'
echo '# Forever: Stop old Process     #'
echo '#################################'
echo ''

forever stop amvis-server.js

echo ''
echo '#################################'
echo '# Forever: Start new Process    #'
echo '#################################'
echo ''

forever -o ~/.forever/amvis-out.log -e ~/.forever/amvis-err.log --append start amvis-server.js

echo ''
echo '#################################'
echo '# Forever: Current Processes:   #'
echo '#################################'
echo ''

forever list

echo ''
echo '#################################'
echo '# Tail current Output Log       #'
echo '#################################'
echo ''
echo 'tail -f /home/fannon/.forever/obacht-out.log'
tail -f /home/fannon/.forever/amvis-out.log
