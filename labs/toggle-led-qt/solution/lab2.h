#include <QObject>

class myQtObj : public QObject
{
    Q_OBJECT

public slots:
    void doSomething(bool);
};

