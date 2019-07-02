#!/bin/bash

set -m

mongodb_cmd="mongod"
cmd="$mongodb_cmd --bind_ip=127.0.0.1,$USEIP"
if [ "$AUTH" == "yes" ]; then
    cmd="$cmd --auth"
fi

if [ "$JOURNALING" == "no" ]; then
    cmd="$cmd --nojournal"
fi

if [ "$OPLOG_SIZE" != "" ]; then
    cmd="$cmd --oplogSize $OPLOG_SIZE"
fi

$cmd &
mongodump --host $USEIP --db $MONGO_DATABASE -o /data/dump
mongorestore --host=$USEIP --db $MONGO_DATABASE --drop /data/$MONGO_DATABASE
fg
